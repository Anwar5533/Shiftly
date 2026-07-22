/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchJobs(query: string, filters: any = {}) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { category, minPayRate } = filters;

    // Build Prisma where clause
    const where: any = { status: 'PUBLISHED' };

    if (query) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (category) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      where.jobType = category;
    }

    if (minPayRate) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      where.salaryMin = { gte: Number(minPayRate) };
    }

    return this.prisma.job.findMany({
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employer: {
          select: { companyName: true, industry: true },
        },
      },
    });
  }
}
