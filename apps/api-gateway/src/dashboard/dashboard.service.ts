/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly httpService: HttpService) {}

  private extractData<T>(response: PromiseSettledResult<{ data: unknown }>, fallback: T): T {
    if (response.status === 'fulfilled') {
      const payload = response.value.data as Record<string, unknown> | null;

      if (payload && payload.success && payload.data !== undefined) {
        return payload.data as T;
      }

      return (payload as unknown as T) || fallback;
    }

    return fallback;
  }

  async getWorkerDashboard(userId: string) {
    this.logger.debug(`Fetching worker dashboard data for userId: ${userId}`);

    try {
      const [userResponse, shiftsResponse, applicationsResponse] = await Promise.allSettled([
        firstValueFrom(
          this.httpService.get(
            `${process.env.USER_SERVICE_URL || 'http://localhost:3004/api/v1'}/workers/${userId}/profile`,
            { headers: { 'x-user-id': userId } },
          ),
        ),
        firstValueFrom(
          this.httpService.get(
            `${process.env.JOBS_SERVICE_URL || 'http://localhost:3005/api/v1'}/shifts/my`,
            { headers: { 'x-user-id': userId } },
          ),
        ),
        firstValueFrom(
          this.httpService.get(
            `${process.env.APPLICATIONS_SERVICE_URL || 'http://localhost:3006/api/v1'}/applications/my-applications`,
            { headers: { 'x-user-id': userId } },
          ),
        ),
      ]);

      const profile = this.extractData(userResponse, null);
      if (userResponse.status === 'rejected') {
        this.logger.warn(`Failed to fetch user profile for ${userId}`, userResponse.reason);
      }

      const upcomingShifts = this.extractData(shiftsResponse, []);
      if (shiftsResponse.status === 'rejected') {
        this.logger.warn(`Failed to fetch upcoming shifts for ${userId}`, shiftsResponse.reason);
      }

      const pendingApplications = this.extractData(applicationsResponse, []);
      if (applicationsResponse.status === 'rejected') {
        this.logger.warn(
          `Failed to fetch pending applications for ${userId}`,
          applicationsResponse.reason,
        );
      }

      return {
        profile,
        upcomingShifts,
        pendingApplications,
      };
    } catch (error) {
      this.logger.error(`Error aggregating dashboard data for userId: ${userId}`, error);
      throw error;
    }
  }
  async getEmployerDashboard(userId: string) {
    this.logger.debug(`Fetching employer dashboard data for userId: ${userId}`);

    try {
      const [userResponse, jobsResponse, applicationsResponse] = await Promise.allSettled([
        firstValueFrom(
          this.httpService.get(
            `${process.env.USER_SERVICE_URL || 'http://localhost:3004/api/v1'}/employers/${userId}/profile`,
            { headers: { 'x-user-id': userId } },
          ),
        ),
        firstValueFrom(
          this.httpService.get(
            `${process.env.JOBS_SERVICE_URL || 'http://localhost:3005/api/v1'}/jobs/my-jobs`,
            { headers: { 'x-user-id': userId } },
          ),
        ),
        firstValueFrom(
          this.httpService.get(
            `${process.env.APPLICATIONS_SERVICE_URL || 'http://localhost:3006/api/v1'}/applications/recent`,
            { headers: { 'x-user-id': userId } },
          ),
        ),
      ]);

      const profile = userResponse.status === 'fulfilled' ? userResponse.value.data : null;
      if (userResponse.status === 'rejected') {
        this.logger.warn(`Failed to fetch employer profile for ${userId}`, userResponse.reason);
      }

      const activeJobs = this.extractData(jobsResponse, []);
      if (jobsResponse.status === 'rejected') {
        this.logger.warn(`Failed to fetch active jobs for ${userId}`, jobsResponse.reason);
      }

      const pendingApplications =
        applicationsResponse.status === 'fulfilled' ? applicationsResponse.value.data : [];
      if (applicationsResponse.status === 'rejected') {
        this.logger.warn(
          `Failed to fetch pending applications for employer ${userId}`,
          applicationsResponse.reason,
        );
      }

      return {
        profile,
        activeJobs,
        pendingApplications,
      };
    } catch (error) {
      this.logger.error(`Error aggregating employer dashboard data for userId: ${userId}`, error);
      throw error;
    }
  }

  async getAdminDashboard() {
    this.logger.debug(`Fetching admin dashboard data`);

    try {
      const [usersResponse, jobsResponse, analyticsResponse] = await Promise.allSettled([
        firstValueFrom(
          this.httpService.get(
            `${process.env.USER_SERVICE_URL || 'http://localhost:3004/api/v1'}/admin/users/stats`,
          ),
        ),
        firstValueFrom(
          this.httpService.get(
            `${process.env.JOBS_SERVICE_URL || 'http://localhost:3005/api/v1'}/jobs/stats`,
          ),
        ),
        firstValueFrom(
          this.httpService.get(
            `${process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3007/api/v1'}/analytics/summary`,
          ),
        ),
      ]);

      const userStats = this.extractData(usersResponse, { totalUsers: 0 });
      if (usersResponse.status === 'rejected') {
        this.logger.warn(`Failed to fetch user stats`, usersResponse.reason);
      }

      const jobStats = this.extractData(jobsResponse, {
        totalActiveJobs: 0,
        totalCompletedShifts: 0,
      });
      if (jobsResponse.status === 'rejected') {
        this.logger.warn(`Failed to fetch job stats`, jobsResponse.reason);
      }

      const analyticsSummary = this.extractData(analyticsResponse, {
        totalPlatformRevenue: 0,
        recentActivity: [],
      });
      if (analyticsResponse.status === 'rejected') {
        this.logger.warn(`Failed to fetch analytics summary`, analyticsResponse.reason);
      }

      return {
        stats: {
          totalUsers: userStats.totalUsers || 0,
          totalActiveJobs: jobStats.totalActiveJobs || 0,
          totalCompletedShifts: jobStats.totalCompletedShifts || 0,
          totalPlatformRevenue: analyticsSummary.totalPlatformRevenue || 0,
        },
        recentActivity: analyticsSummary.recentActivity || [],
      };
    } catch (error) {
      this.logger.error(`Error aggregating admin dashboard data`, error);
      throw error;
    }
  }
}
