import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JobStatus, Prisma } from '@prisma/client-jobs-service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async createJob(userId: string, createJobDto: CreateJobDto) {
    // employer lookup removed, assume valid employer ID from token for now

    try {
      return await this.prisma.$transaction(async (tx) => {
        const job = await tx.job.create({
          data: {
            ...createJobDto,
            employerId: userId,
            status: JobStatus.PUBLISHED, // Auto-publish for now, could be DRAFT
            publishedAt: new Date(),
          },
        });

        // auditLog removed

        return job;
      });
    } catch (error) {
      console.error('Error creating job:', error);
      throw new InternalServerErrorException('Failed to create job');
    }
  }

  async searchJobs(searchDto: SearchJobsDto) {
    const { query, jobType, status, city, minSalary, employerId, page = 1, limit = 10 } = searchDto;

    const where: Prisma.JobWhereInput = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (employerId) {
      where.employerId = employerId;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = JobStatus.PUBLISHED; // Default to showing only published jobs
    }

    if (minSalary) {
      where.salaryMin = { gte: minSalary };
    }

    if (city) {
      // In a real pg implementation, we'd use JSON operators for exact city match inside `location`
      // For now, this is a simplified string matching on JSON representation
      where.location = {
        path: ['city'],
        string_contains: city,
      };
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      items: jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getJobById(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.deletedAt) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async closeJob(userId: string, jobId: string) {
    // employer lookup removed as EmployerProfile is in user-service

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.deletedAt) {
      throw new NotFoundException('Job not found');
    }

    if (job.employerId !== userId) {
      throw new ForbiddenException('Not authorized to close this job');
    }

    if (job.status === JobStatus.FILLED || job.status === JobStatus.ARCHIVED) {
      throw new ForbiddenException('Job is already closed or archived');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: { status: JobStatus.FILLED },
      });

      // auditLog removed

      return updatedJob;
    });
  }

  async handleApplicationApproved(payload: {
    applicationId: string;
    jobId: string;
    workerId: string;
    employerId: string;
  }) {
    const { applicationId, jobId, workerId } = payload;

    // Idempotency check: Ensure the Shift doesn't already exist for this application
    const existingShift = await this.prisma.shift.findUnique({
      where: { applicationId },
    });
    if (existingShift) {
      console.log(`[Idempotency] Shift already exists for application ${applicationId}. Skipping.`);
      return;
    }

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      console.error(`Job ${jobId} not found for application ${applicationId}`);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      // Create the Shift
      const shiftDuration = Number(job.shiftDurationHours || 8);
      const scheduledStart = job.startDate;
      const scheduledEnd =
        job.endDate || new Date(scheduledStart.getTime() + shiftDuration * 60 * 60 * 1000);

      await tx.shift.create({
        data: {
          jobId,
          applicationId,
          workerId,
          status: 'SCHEDULED',
          scheduledStart,
          scheduledEnd,
        },
      });

      // Decrement remaining openings by incrementing positionsFilled
      await tx.job.update({
        where: { id: jobId },
        data: {
          positionsFilled: { increment: 1 },
        },
      });
    });
  }

  async updateJob(userId: string, jobId: string, updateDto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.deletedAt) {
      throw new NotFoundException('Job not found');
    }

    if (job.employerId !== userId) {
      throw new ForbiddenException('Not authorized to update this job');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        data: updateDto as any,
      });

      // auditLog removed

      return updatedJob;
    });
  }

  async deleteJob(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.deletedAt) {
      throw new NotFoundException('Job not found');
    }

    if (job.employerId !== userId) {
      throw new ForbiddenException('Not authorized to delete this job');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: { deletedAt: new Date(), status: JobStatus.ARCHIVED },
      });

      // auditLog removed

      return updatedJob;
    });
  }

  async getMyJobs(userId: string, page: number = 1, limit: number = 10) {
    const isSuperAdmin = false; // TODO: get from request/token
    // employer lookup removed view their jobs');

    const skip = (page - 1) * limit;

    const whereClause = isSuperAdmin
      ? { deletedAt: null }
      : { employerId: userId, deletedAt: null };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where: isSuperAdmin ? {} : { employerId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.job.count({
        where: whereClause,
      }),
    ]);

    return {
      items: jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
