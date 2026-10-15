import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class TokenDenylistService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(TokenDenylistService.name);
  private redis: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));
    const password = this.configService.get<string>('REDIS_PASSWORD') || undefined;
    const db = Number(this.configService.get<number>('REDIS_DB', 0));

    this.redis = new Redis({
      host,
      port,
      password,
      db,
      keyPrefix: 'shiftly:',
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (attempt) => Math.min(attempt * 200, 2000),
    });

    this.redis.on('error', (error: Error) => {
      this.logger.warn(`Redis token denylist unavailable: ${error.message}`);
    });

    void this.redis.connect().catch(() => undefined);
  }

  async onModuleInit(): Promise<void> {
    // Redis lazy-connect initiated
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.redis) {
      await this.redis.quit().catch(() => undefined);
    }
  }

  /**
   * Checks whether the given session or user has been revoked.
   * Fails open (returns false) if Redis is unavailable to preserve service uptime.
   */
  async isRevoked(sessionId?: string, userId?: string): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      if (sessionId) {
        const sessionRevoked = await this.redis.get(`denylist:session:${sessionId}`);
        if (sessionRevoked) {
          return true;
        }
      }

      if (userId) {
        const userRevoked = await this.redis.get(`denylist:user:${userId}`);
        if (userRevoked) {
          return true;
        }
      }

      return false;
    } catch (error: unknown) {
      this.logger.warn(
        `Failed to query Redis token denylist: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
