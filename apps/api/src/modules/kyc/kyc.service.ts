/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
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
    // Check if a user already submitted KYC that is pending or approved
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: true },
    });

    if (!user) throw new BadRequestException('User not found');
    if (user.status === 'ACTIVE' || user.status === 'PENDING_VERIFICATION') {
      // Technically status changes based on role/KYC, but we allow resubmitting if needed, unless they are already fully verified.
      // For mock, let's just create the documents.
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

    // Update User and profiles to UNDER_REVIEW
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'PENDING_KYC' },
    });

    if (user.role === 'WORKER') {
      await this.prisma.workerProfile.update({
        where: { userId },
        data: { kycStatus: 'UNDER_REVIEW' },
      });
    } else if (user.role === 'EMPLOYER') {
      await this.prisma.employerProfile.update({
        where: { userId },
        data: { kycStatus: 'UNDER_REVIEW' },
      });
    } else if (user.role === 'RECRUITER') {
      await this.prisma.recruiterProfile.update({
        where: { userId },
        data: { kycStatus: 'UNDER_REVIEW' },
      });
    }

    // Simulate auto-approval after a delay (mocking the Admin KYC process for phase 8)
// eslint-disable-next-line @typescript-eslint/no-misused-promises -- TODO(RC3): Address type safety
    setTimeout(() => this.autoApproveKyc(userId), 15000);

    return { message: 'KYC submitted successfully', documents: createdDocs };
  }

  async getKycStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        workerProfile: { select: { kycStatus: true } },
        employerProfile: { select: { kycStatus: true } },
        recruiterProfile: { select: { kycStatus: true } },
      },
    });

    if (!user) throw new BadRequestException('User not found');

    let kycStatus = 'NOT_STARTED';
    if (user.role === 'WORKER')
      kycStatus = user.workerProfile?.kycStatus || 'NOT_STARTED';
    else if (user.role === 'EMPLOYER')
      kycStatus = user.employerProfile?.kycStatus || 'NOT_STARTED';
    else if (user.role === 'RECRUITER')
      kycStatus = user.recruiterProfile?.kycStatus || 'NOT_STARTED';

    return { status: kycStatus };
  }

  // Helper to mock the admin approval flow
  private async autoApproveKyc(userId: string) {
    await this.prisma.kycDocument.updateMany({
      where: { userId, status: 'PENDING' },
      data: { status: 'APPROVED', reviewedAt: new Date() },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    if (user.role === 'WORKER') {
      await this.prisma.workerProfile.update({
        where: { userId },
        data: { kycStatus: 'APPROVED', isVerified: true },
      });
    } else if (user.role === 'EMPLOYER') {
      await this.prisma.employerProfile.update({
        where: { userId },
        data: { kycStatus: 'APPROVED', isVerified: true },
      });
    } else if (user.role === 'RECRUITER') {
      await this.prisma.recruiterProfile.update({
        where: { userId },
        data: { kycStatus: 'APPROVED', isVerified: true },
      });
    }
  }
}
