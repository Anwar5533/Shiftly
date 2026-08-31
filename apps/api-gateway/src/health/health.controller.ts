import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { DownstreamHealthIndicator } from './downstream-health.indicator';

/**
 * Probe surface for Kubernetes. Deliberately unauthenticated and outside the
 * global `api/v1` prefix so kubelet does not need a token, and mounted before
 * the proxy middleware so probes never leave the gateway.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly downstream: DownstreamHealthIndicator,
  ) {}

  /**
   * Liveness answers "is this process wedged". It must not touch dependencies —
   * a downstream outage should never trigger a pod restart loop.
   */
  @Get('live')
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  liveness(): { status: string; uptime: number; timestamp: string } {
    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness answers "can this pod serve traffic". The gateway is only useful
   * if it can reach the identity service, so that one is required; the rest are
   * reported for observability without failing the probe.
   */
  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Kubernetes readiness probe — checks critical downstreams' })
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([() => this.downstream.isHealthy('downstreams')]);
  }

  /** Startup probe: config is validated at bootstrap, so reaching here is enough. */
  @Get('startup')
  @ApiOperation({ summary: 'Kubernetes startup probe' })
  startup(): { status: string } {
    return { status: 'ok' };
  }
}
