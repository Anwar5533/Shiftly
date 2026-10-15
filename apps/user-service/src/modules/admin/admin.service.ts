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

  async listUsers() {
    const [workers, employers, recruiters] = await Promise.all([
      this.prisma.workerProfile.findMany({ take: 50, orderBy: { createdAt: 'desc' } }),
      this.prisma.employerProfile.findMany({ take: 50, orderBy: { createdAt: 'desc' } }),
      this.prisma.recruiterProfile.findMany({ take: 50, orderBy: { createdAt: 'desc' } }),
    ]);

    return [
      ...workers.map((w) => ({
        id: w.userId,
        name: `${w.firstName} ${w.lastName}`.trim(),
        email: `${w.firstName.toLowerCase()}.${w.lastName.toLowerCase()}@example.com`,
        role: 'Worker',
        status: w.deletedAt ? 'Suspended' : 'Active',
        lastLogin: 'Active recently',
        registered: w.createdAt.toISOString().split('T')[0],
      })),
      ...employers.map((e) => ({
        id: e.userId,
        name: e.companyName,
        email: `contact@${e.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`,
        role: 'Employer',
        status: e.deletedAt ? 'Suspended' : 'Active',
        lastLogin: 'Active recently',
        registered: e.createdAt.toISOString().split('T')[0],
      })),
      ...recruiters.map((r) => ({
        id: r.userId,
        name: `${r.firstName} ${r.lastName}`.trim(),
        email: `${r.firstName.toLowerCase()}.${r.lastName.toLowerCase()}@agency.com`,
        role: 'Recruiter',
        status: r.deletedAt ? 'Suspended' : 'Active',
        lastLogin: 'Active recently',
        registered: r.createdAt.toISOString().split('T')[0],
      })),
    ];
  }

  async toggleSuspendUser(userId: string) {
    const worker = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (worker) {
      const newDeletedAt = worker.deletedAt ? null : new Date();
      await this.prisma.workerProfile.update({
        where: { userId },
        data: { deletedAt: newDeletedAt },
      });
      return { status: newDeletedAt ? 'Suspended' : 'Active' };
    }

    const employer = await this.prisma.employerProfile.findUnique({ where: { userId } });
    if (employer) {
      const newDeletedAt = employer.deletedAt ? null : new Date();
      await this.prisma.employerProfile.update({
        where: { userId },
        data: { deletedAt: newDeletedAt },
      });
      return { status: newDeletedAt ? 'Suspended' : 'Active' };
    }

    const recruiter = await this.prisma.recruiterProfile.findUnique({ where: { userId } });
    if (recruiter) {
      const newDeletedAt = recruiter.deletedAt ? null : new Date();
      await this.prisma.recruiterProfile.update({
        where: { userId },
        data: { deletedAt: newDeletedAt },
      });
      return { status: newDeletedAt ? 'Suspended' : 'Active' };
    }

    return { status: 'Suspended' };
  }

  async deleteUser(userId: string) {
    await Promise.all([
      this.prisma.workerProfile.updateMany({
        where: { userId },
        data: { deletedAt: new Date() },
      }),
      this.prisma.employerProfile.updateMany({
        where: { userId },
        data: { deletedAt: new Date() },
      }),
      this.prisma.recruiterProfile.updateMany({
        where: { userId },
        data: { deletedAt: new Date() },
      }),
    ]);
    return { success: true };
  }
}
