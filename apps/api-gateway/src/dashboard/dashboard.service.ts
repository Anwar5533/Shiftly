/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly httpService: HttpService) {}

  async getWorkerDashboard(userId: string) {
    this.logger.debug(`Fetching worker dashboard data for userId: ${userId}`);

    try {
      const [userResponse, shiftsResponse, applicationsResponse] = await Promise.allSettled([
        firstValueFrom(
          this.httpService.get(
            `${process.env.USER_SERVICE_URL || 'http://localhost:3002'}/workers/${userId}`,
          ),
        ),
        firstValueFrom(
          this.httpService.get(
            `${process.env.JOBS_SERVICE_URL || 'http://localhost:3003'}/shifts/upcoming?workerId=${userId}`,
          ),
        ),
        firstValueFrom(
          this.httpService.get(
            `${process.env.APPLICATIONS_SERVICE_URL || 'http://localhost:3004'}/applications/pending?workerId=${userId}`,
          ),
        ),
      ]);

      const profile = userResponse.status === 'fulfilled' ? userResponse.value.data : null;
      if (userResponse.status === 'rejected') {
        this.logger.warn(`Failed to fetch user profile for ${userId}`, userResponse.reason);
      }

      const upcomingShifts = shiftsResponse.status === 'fulfilled' ? shiftsResponse.value.data : [];
      if (shiftsResponse.status === 'rejected') {
        this.logger.warn(`Failed to fetch upcoming shifts for ${userId}`, shiftsResponse.reason);
      }

      const pendingApplications =
        applicationsResponse.status === 'fulfilled' ? applicationsResponse.value.data : [];
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
}
