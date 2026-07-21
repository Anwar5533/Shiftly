import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { JobStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [activeUsers, jobsProcessed, pendingKyc] = await Promise.all([
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.job.count({ where: { status: { in: [JobStatus.PUBLISHED, JobStatus.ARCHIVED] } } }),
      // Simulate pending KYC count for now until we have a KYC module
      Promise.resolve(Math.floor(Math.random() * 20) + 5)
    ]);

    return {
      activeUsers,
      jobsProcessed,
      pendingKyc,
      isApiHealthy: true
    };
  }
}
