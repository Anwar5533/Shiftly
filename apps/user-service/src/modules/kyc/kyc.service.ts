import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { DocumentType } from '@prisma/client';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  async submitKyc(
    userId: string,
    documents: {
      type: DocumentType;
      url: string;
      fileName: string;
      fileSize: number;
    }[],
  ) {
    // Check if user has an active profile
    const [worker, employer, recruiter] = await Promise.all([
      this.prisma.workerProfile.findUnique({ where: { userId } }),
      this.prisma.employerProfile.findUnique({ where: { userId } }),
      this.prisma.recruiterProfile.findUnique({ where: { userId } }),
    ]);

    if (!worker && !employer && !recruiter) {
      throw new BadRequestException('User profile not found');
    }

    // Save documents
    const createdDocs = await Promise.all(
      documents.map((doc) =>
        this.prisma.kycDocument.create({
          data: {
            userId,
            type: doc.type,
            fileUrl: doc.url,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            status: 'PENDING',
          },
        }),
      ),
    );

    // Update profiles to UNDER_REVIEW
    await Promise.all([
      this.prisma.workerProfile.updateMany({
        where: { userId },
        data: { kycStatus: 'UNDER_REVIEW' },
      }),
      this.prisma.employerProfile.updateMany({
        where: { userId },
        data: { kycStatus: 'UNDER_REVIEW' },
      }),
      this.prisma.recruiterProfile.updateMany({
        where: { userId },
        data: { kycStatus: 'UNDER_REVIEW' },
      }),
    ]);

    // Simulate auto-approval after a delay (mocking the Admin KYC process for phase 8)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- TODO(RC3): Address type safety
    setTimeout(() => this.autoApproveKyc(userId), 15000);

    return { message: 'KYC submitted successfully', documents: createdDocs };
  }

  async getKycStatus(userId: string) {
    const [worker, employer, recruiter] = await Promise.all([
      this.prisma.workerProfile.findUnique({ where: { userId }, select: { kycStatus: true } }),
      this.prisma.employerProfile.findUnique({ where: { userId }, select: { kycStatus: true } }),
      this.prisma.recruiterProfile.findUnique({ where: { userId }, select: { kycStatus: true } }),
    ]);

    if (!worker && !employer && !recruiter) throw new BadRequestException('User not found');

    let kycStatus = 'NOT_STARTED';
    if (worker?.kycStatus) kycStatus = worker.kycStatus;
    else if (employer?.kycStatus) kycStatus = employer.kycStatus;
    else if (recruiter?.kycStatus) kycStatus = recruiter.kycStatus;

    return { status: kycStatus };
  }

  // Helper to mock the admin approval flow
  private async autoApproveKyc(userId: string) {
    await this.prisma.kycDocument.updateMany({
      where: { userId, status: 'PENDING' },
      data: { status: 'APPROVED', reviewedAt: new Date() },
    });

    // TODO: Emit event to identity-service so it can update the User global status

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
  }
}
