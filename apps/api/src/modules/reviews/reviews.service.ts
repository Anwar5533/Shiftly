import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(data: {
    jobId: string;
    reviewerId: string;
    revieweeId: string;
    targetType: any;
    rating: number;
    comment?: string;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { jobId, reviewerId, revieweeId, targetType, rating, comment } = data;

    // Optional: check if shift/job is completed
    const existingReview = await this.prisma.review.findUnique({
      where: {
        jobId_reviewerId_revieweeId: {
          jobId,
          reviewerId,
          revieweeId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'Review already exists for this job between these users',
      );
    }

    return this.prisma.review.create({
      data: {
        jobId,
        reviewerId,
        revieweeId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        targetType,
        rating,
        comment,
      },
    });
  }

  async getReviewsForUser(userId: string) {
    return this.prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            workerProfile: { select: { firstName: true, lastName: true } },
            employerProfile: { select: { companyName: true } },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
