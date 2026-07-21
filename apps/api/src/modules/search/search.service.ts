import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchJobs(query: string, filters: any = {}) {
    const { category, minPayRate } = filters;

    // Build Prisma where clause
    const where: any = { status: 'PUBLISHED' };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.jobType = category;
    }

    if (minPayRate) {
      where.salaryMin = { gte: Number(minPayRate) };
    }

    return this.prisma.job.findMany({
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
