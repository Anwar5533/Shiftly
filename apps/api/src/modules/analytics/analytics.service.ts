import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformStats() {
    const totalUsers = await this.prisma.user.count();
    const activeJobs = await this.prisma.job.count({
      where: { status: 'PUBLISHED' },
    });
    const completedShifts = await this.prisma.shift.count({
      where: { status: 'COMPLETED' },
    });

    // In a real app, gross payment volume would be calculated from timesheets or payments table
    // For now, we will mock it based on completed shifts
    const grossPaymentVolume = completedShifts * 120; // Assume ~$120 avg per shift

    return {
      totalUsers,
      activeJobs,
      completedShifts,
      grossPaymentVolume,
      activeUsersGrowth: '+12%',
      jobsGrowth: '+5%',
      shiftsGrowth: '+8%',
      volumeGrowth: '+15%',
    };
  }

  async getRevenueOverTime() {
    // Mock data for charts
    return [
      { name: 'Jan', value: 12000 },
      { name: 'Feb', value: 15000 },
      { name: 'Mar', value: 18000 },
      { name: 'Apr', value: 22000 },
      { name: 'May', value: 26000 },
      { name: 'Jun', value: 31000 },
    ];
  }
}
