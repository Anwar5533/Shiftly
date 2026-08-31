import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import { catchError, firstValueFrom, map, of, timeout } from 'rxjs';

/**
 * Downstream services the gateway proxies to. `required: true` means the
 * gateway reports NOT ready without it — reserve that for dependencies where
 * serving traffic would be actively misleading.
 */
const DOWNSTREAMS: { name: string; envVar: string; required: boolean }[] = [
  { name: 'identity', envVar: 'IDENTITY_URL', required: true },
  { name: 'user', envVar: 'USER_URL', required: false },
  { name: 'jobs', envVar: 'JOBS_URL', required: false },
  { name: 'applications', envVar: 'APPLICATIONS_URL', required: false },
  { name: 'analytics', envVar: 'ANALYTICS_URL', required: false },
  { name: 'search', envVar: 'SEARCH_URL', required: false },
  { name: 'payments', envVar: 'PAYMENTS_URL', required: false },
  { name: 'documents', envVar: 'DOCUMENTS_URL', required: false },
  { name: 'notifications', envVar: 'NOTIFICATIONS_URL', required: false },
];

type DownstreamStatus = 'up' | 'down' | 'unconfigured';

@Injectable()
export class DownstreamHealthIndicator {
  private readonly logger = new Logger(DownstreamHealthIndicator.name);
  private readonly probeTimeoutMs = Number(process.env.HEALTH_PROBE_TIMEOUT_MS ?? 2000);

  constructor(private readonly httpService: HttpService) {}

  private async pingOne(baseUrl: string): Promise<boolean> {
    return firstValueFrom(
      this.httpService.get(`${baseUrl.replace(/\/$/, '')}/health/live`).pipe(
        timeout(this.probeTimeoutMs),
        map(() => true),
        catchError(() => of(false)),
      ),
    );
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const results = await Promise.all(
      DOWNSTREAMS.map(async (service) => {
        const baseUrl = process.env[service.envVar];
        if (!baseUrl) {
          return { ...service, status: 'unconfigured' as DownstreamStatus };
        }
        const up = await this.pingOne(baseUrl);
        return { ...service, status: (up ? 'up' : 'down') as DownstreamStatus };
      }),
    );

    const detail: Record<string, DownstreamStatus> = Object.fromEntries(
      results.map((r) => [r.name, r.status]),
    );
    const blocking = results.filter((r) => r.required && r.status !== 'up');

    if (blocking.length > 0) {
      const names = blocking.map((b) => b.name).join(', ');
      this.logger.warn(`Not ready — required downstreams unavailable: ${names}`);
      throw new HealthCheckError('Required downstream unavailable', {
        [key]: { status: 'down', ...detail },
      });
    }

    return { [key]: { status: 'up', ...detail } };
  }
}
