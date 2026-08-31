import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { catchError, firstValueFrom, timeout, TimeoutError } from 'rxjs';

/**
 * Envelope every downstream microservice wraps its payload in.
 * Kept permissive because not all services are on the same version yet.
 */
interface ServiceEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export interface WorkerDashboard {
  profile: Record<string, unknown> | null;
  upcomingShifts: unknown[];
  pendingApplications: unknown[];
  degraded: string[];
}

export interface EmployerDashboard {
  profile: Record<string, unknown> | null;
  activeJobs: unknown[];
  pendingApplications: unknown[];
  degraded: string[];
}

export interface AdminDashboard {
  stats: {
    totalUsers: number;
    totalActiveJobs: number;
    totalCompletedShifts: number;
    totalPlatformRevenue: number;
  };
  recentActivity: unknown[];
  degraded: string[];
}

/** A single downstream fetch, named so we can report which fan-out leg failed. */
interface Leg<T> {
  name: string;
  url: string;
  fallback: T;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  /**
   * Per-leg deadline. The gateway must always answer faster than the client's
   * own timeout, otherwise a single slow microservice turns into a 504 at the
   * edge. Each leg is capped independently and falls back to empty data.
   */
  private readonly legTimeoutMs = Number(process.env.DOWNSTREAM_TIMEOUT_MS ?? 5000);

  constructor(private readonly httpService: HttpService) {}

  private buildHeaders(bearerToken: string, traceparent?: string): Record<string, string> {
    const headers: Record<string, string> = { Authorization: `Bearer ${bearerToken}` };
    if (traceparent) headers.traceparent = traceparent;
    return headers;
  }

  /**
   * Unwraps `{ success, data }` envelopes. A downstream error envelope
   * (`success: false`) is treated as a failure and yields the fallback rather
   * than leaking the envelope to the browser as if it were data.
   */
  private unwrap<T>(response: AxiosResponse<ServiceEnvelope<T> | T>, fallback: T): T {
    const body = response.data;

    if (body && typeof body === 'object' && 'success' in body) {
      const envelope: ServiceEnvelope<T> = body;
      if (envelope.success === false) return fallback;
      if (envelope.data !== undefined) return envelope.data;
      return fallback;
    }

    return (body as T) ?? fallback;
  }

  /**
   * Runs every leg concurrently with an independent deadline, so one slow
   * dependency degrades a single card instead of failing the whole dashboard.
   * Returns the resolved values plus the names of the legs that fell back.
   */
  private async fanOut(
    legs: Leg<unknown>[],
    headers: Record<string, string>,
  ): Promise<{ values: unknown[]; degraded: string[] }> {
    const settled = await Promise.allSettled(
      legs.map((leg) =>
        firstValueFrom(
          this.httpService.get<ServiceEnvelope<unknown>>(leg.url, { headers }).pipe(
            timeout(this.legTimeoutMs),
            catchError((error: unknown) => {
              throw error instanceof TimeoutError
                ? new Error(`timeout after ${this.legTimeoutMs}ms`)
                : error;
            }),
          ),
        ),
      ),
    );

    const values: unknown[] = [];
    const degraded: string[] = [];

    settled.forEach((result, index) => {
      const leg = legs[index];
      if (result.status === 'fulfilled') {
        values.push(this.unwrap(result.value, leg.fallback));
        return;
      }

      degraded.push(leg.name);
      this.logger.warn(
        `Dashboard leg "${leg.name}" failed (${leg.url}): ${
          result.reason instanceof Error ? result.reason.message : String(result.reason)
        }`,
      );
      values.push(leg.fallback);
    });

    return { values, degraded };
  }

  async getWorkerDashboard(
    userId: string,
    bearerToken: string,
    traceparent?: string,
  ): Promise<WorkerDashboard> {
    const headers = this.buildHeaders(bearerToken, traceparent);

    const { values, degraded } = await this.fanOut(
      [
        {
          name: 'profile',
          url: `${process.env.USER_URL}/workers/${userId}/profile`,
          fallback: null,
        },
        { name: 'upcomingShifts', url: `${process.env.JOBS_URL}/shifts/my`, fallback: [] },
        {
          name: 'pendingApplications',
          url: `${process.env.APPLICATIONS_URL}/applications/my-applications`,
          fallback: [],
        },
      ],
      headers,
    );

    // The profile is the only leg the worker dashboard cannot render without.
    if (degraded.includes('profile') && degraded.length === 3) {
      throw new ServiceUnavailableException('Dashboard dependencies are unavailable');
    }

    return {
      profile: values[0] as Record<string, unknown> | null,
      upcomingShifts: values[1] as unknown[],
      pendingApplications: values[2] as unknown[],
      degraded,
    };
  }

  async getEmployerDashboard(
    userId: string,
    bearerToken: string,
    traceparent?: string,
  ): Promise<EmployerDashboard> {
    const headers = this.buildHeaders(bearerToken, traceparent);

    const { values, degraded } = await this.fanOut(
      [
        {
          name: 'profile',
          url: `${process.env.USER_URL}/employers/${userId}/profile`,
          fallback: null,
        },
        { name: 'activeJobs', url: `${process.env.JOBS_URL}/jobs/my-jobs`, fallback: [] },
        {
          name: 'pendingApplications',
          url: `${process.env.APPLICATIONS_URL}/applications/recent`,
          fallback: [],
        },
      ],
      headers,
    );

    if (degraded.length === 3) {
      throw new ServiceUnavailableException('Dashboard dependencies are unavailable');
    }

    return {
      profile: values[0] as Record<string, unknown> | null,
      activeJobs: values[1] as unknown[],
      pendingApplications: values[2] as unknown[],
      degraded,
    };
  }

  /**
   * SECURITY: the admin legs previously went out with no Authorization header,
   * so downstream stat endpoints were either called anonymously or silently
   * rejected (masked by the fallbacks). The verified caller token is now
   * forwarded like every other leg.
   */
  async getAdminDashboard(bearerToken: string, traceparent?: string): Promise<AdminDashboard> {
    const headers = this.buildHeaders(bearerToken, traceparent);

    const { values, degraded } = await this.fanOut(
      [
        {
          name: 'userStats',
          url: `${process.env.USER_URL}/admin/users/stats`,
          fallback: { totalUsers: 0 },
        },
        {
          name: 'jobStats',
          url: `${process.env.JOBS_URL}/jobs/stats`,
          fallback: { totalActiveJobs: 0, totalCompletedShifts: 0 },
        },
        {
          name: 'analyticsSummary',
          url: `${process.env.ANALYTICS_URL}/analytics/summary`,
          fallback: { totalPlatformRevenue: 0, recentActivity: [] },
        },
      ],
      headers,
    );

    const userStats = values[0] as { totalUsers?: number };
    const jobStats = values[1] as { totalActiveJobs?: number; totalCompletedShifts?: number };
    const analytics = values[2] as { totalPlatformRevenue?: number; recentActivity?: unknown[] };

    return {
      stats: {
        totalUsers: userStats.totalUsers ?? 0,
        totalActiveJobs: jobStats.totalActiveJobs ?? 0,
        totalCompletedShifts: jobStats.totalCompletedShifts ?? 0,
        totalPlatformRevenue: analytics.totalPlatformRevenue ?? 0,
      },
      recentActivity: analytics.recentActivity ?? [],
      degraded,
    };
  }
}
