/* eslint-disable prettier/prettier, @typescript-eslint/no-unused-vars -- TODO(RC3): Address type safety */
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
import { JobStatus, Prisma } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async createJob(userId: string, createJobDto: CreateJobDto) {
    // Ensure the user is an employer
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException('Only verified employers can post jobs');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const job = await tx.job.create({
          data: {
            ...createJobDto,
            employerId: employer.id,
            status: JobStatus.PUBLISHED, // Auto-publish for now, could be DRAFT
            publishedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: userId,
            action: 'CREATE',
            resourceType: 'Job',
            resourceId: job.id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
            newValues: createJobDto as any,
          },
        });

        return job;
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create job');
    }
  }

  async searchJobs(searchDto: SearchJobsDto) {
    const {
      query,
      jobType,
      status,
      city,
      minSalary,
      employerId,
      page = 1,
      limit = 10,
    } = searchDto;

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
        include: {
          employer: {
            select: {
              companyName: true,
              logoUrl: true,
              industry: true,
            },
          },
        },
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
      include: {
        employer: {
          select: {
            companyName: true,
            logoUrl: true,
            industry: true,
            rating: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!job || job.deletedAt) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async closeJob(userId: string, jobId: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException('Only employers can close jobs');
    }

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.deletedAt) {
      throw new NotFoundException('Job not found');
    }

    if (job.employerId !== employer.id) {
      throw new ForbiddenException(
        'You do not have permission to close this job',
      );
    }

    if (job.status === JobStatus.FILLED || job.status === JobStatus.ARCHIVED) {
      throw new ForbiddenException('Job is already closed or archived');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: { status: JobStatus.FILLED },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'UPDATE',
          resourceType: 'Job',
          resourceId: jobId,
          newValues: { status: JobStatus.FILLED },
        },
      });

      return updatedJob;
    });
  }

  async updateJob(userId: string, jobId: string, updateDto: UpdateJobDto) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException('Only employers can update jobs');
    }

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.deletedAt) {
      throw new NotFoundException('Job not found');
    }

    if (job.employerId !== employer.id) {
      throw new ForbiddenException(
        'You do not have permission to update this job',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        data: updateDto as any,
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'UPDATE',
          resourceType: 'Job',
          resourceId: jobId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
          newValues: updateDto as any,
        },
      });

      return updatedJob;
    });
  }

  async deleteJob(userId: string, jobId: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException('Only employers can delete jobs');
    }

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.deletedAt) {
      throw new NotFoundException('Job not found');
    }

    if (job.employerId !== employer.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this job',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: { deletedAt: new Date(), status: JobStatus.ARCHIVED },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'DELETE',
          resourceType: 'Job',
          resourceId: jobId,
        },
      });

      return updatedJob;
    });
  }

  async getMyJobs(userId: string, page: number = 1, limit: number = 10) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException('Only employers can view their jobs');
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where: { employerId: employer.id, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          applications: {
            select: { id: true },
          },
        },
      }),
      this.prisma.job.count({
        where: { employerId: employer.id, deletedAt: null },
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
