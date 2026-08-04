import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [activeUsers, jobsProcessed, pendingKyc] = await Promise.all([
      this.prisma.workerProfile.count(),
      Promise.resolve(0), // No jobs access in user-service

      // Simulate pending KYC count for now until we have a KYC module
      Promise.resolve(Math.floor(Math.random() * 20) + 5),
    ]);

    return {
      activeUsers,
      jobsProcessed,
      pendingKyc,
      isApiHealthy: true,
    };
  }
}
