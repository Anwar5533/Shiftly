import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { Public } from '../../shared/decorators/public.decorator';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';

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

import { PrismaService } from '../../infrastructure/database/prisma.service';

@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  liveness(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: 'Kubernetes readiness probe — checks all dependencies',
  })
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => this.prismaHealth.pingCheck('database', this.prisma),
      async () => this.redisHealth.isHealthy('redis'),
    ]);
  }
}
