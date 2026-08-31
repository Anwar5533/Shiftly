import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(private readonly redisService: RedisService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isAlive = await this.redisService.ping();
    if (!isAlive) {
      throw new Error('Redis is not responding');
    }
    return { [key]: { status: 'up' } };
  }
}
