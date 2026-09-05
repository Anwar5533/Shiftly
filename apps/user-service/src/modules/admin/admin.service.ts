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

  async approveKyc(userId: string) {
    await this.prisma.kycDocument.updateMany({
      where: { userId, status: 'PENDING' },
      data: { status: 'APPROVED', reviewedAt: new Date() },
    });

    await Promise.all([
      this.prisma.workerProfile.updateMany({
        where: { userId },
        data: { kycStatus: 'APPROVED', isVerified: true },
      }),
      this.prisma.employerProfile.updateMany({
        where: { userId },
        data: { kycStatus: 'APPROVED', isVerified: true },
      }),
      this.prisma.recruiterProfile.updateMany({
        where: { userId },
        data: { kycStatus: 'APPROVED', isVerified: true },
      }),
    ]);

    return { message: 'KYC approved successfully' };
  }
}
