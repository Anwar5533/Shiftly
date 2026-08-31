import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis from 'ioredis';

/**
 * Redis-backed throttler storage.
 *
 * The default in-memory storage counts per process, so with N gateway replicas
 * a client effectively gets N× the configured limit. Counting in Redis makes
 * the limit global. If Redis is unreachable we fail *open* (allow the request)
 * rather than locking every user out of the platform — availability wins over
 * strict rate limiting for a non-security control.
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage, OnApplicationShutdown {
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private readonly redis: Redis;
  private readonly prefix = 'throttle:';

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_DB ?? 0),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (attempt) => Math.min(attempt * 200, 2000),
    });

    this.redis.on('error', (error: Error) => {
      // Logged at warn, not error: throttling degrades, the gateway keeps serving.
      this.logger.warn(`Throttler Redis unavailable — failing open: ${error.message}`);
    });

    void this.redis.connect().catch(() => undefined);
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `${this.prefix}${throttlerName}:${key}`;
    const blockKey = `${redisKey}:blocked`;

    try {
      const blockedTtl = await this.redis.pttl(blockKey);
      if (blockedTtl > 0) {
        return {
          totalHits: limit + 1,
          timeToExpire: Math.ceil(blockedTtl / 1000),
          isBlocked: true,
          timeToBlockExpire: Math.ceil(blockedTtl / 1000),
        };
      }

      const [hits, pttl] = (await this.redis
        .multi()
        .incr(redisKey)
        .pttl(redisKey)
        .exec()
        .then((replies) => (replies ?? []).map(([, value]) => value))) as [number, number];

      // A fresh key has no expiry yet; set the window on first hit.
      if (pttl < 0) {
        await this.redis.pexpire(redisKey, ttl);
      }

      const timeToExpire = Math.ceil((pttl < 0 ? ttl : pttl) / 1000);

      if (hits > limit) {
        await this.redis.psetex(blockKey, blockDuration, '1');
        return {
          totalHits: hits,
          timeToExpire,
          isBlocked: true,
          timeToBlockExpire: Math.ceil(blockDuration / 1000),
        };
      }

      return { totalHits: hits, timeToExpire, isBlocked: false, timeToBlockExpire: 0 };
    } catch (error) {
      this.logger.warn(
        `Throttler increment failed, allowing request: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return { totalHits: 0, timeToExpire: 0, isBlocked: false, timeToBlockExpire: 0 };
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit().catch(() => undefined);
  }
}
