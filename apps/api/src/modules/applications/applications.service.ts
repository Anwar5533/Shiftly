/* eslint-disable @typescript-eslint/no-unused-vars -- TODO(RC3): Address type safety */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JobStatus, Prisma } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async applyToJob(userId: string, createDto: CreateApplicationDto) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!worker) {
      throw new ForbiddenException('Only workers can apply for jobs');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: createDto.jobId },
    });
    if (!job || job.deletedAt || job.status !== JobStatus.PUBLISHED) {
      throw new NotFoundException('Job is not available for applications');
    }

    if (job.positionsFilled >= job.positionsTotal) {
      throw new ConflictException(
        'This job is no longer accepting applications (positions filled)',
      );
    }

    const existingApp = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_workerId: {
          jobId: createDto.jobId,
          workerId: worker.id,
        },
      },
    });

    if (existingApp) {
      throw new ConflictException('You have already applied for this job');
    }

    return this.prisma.$transaction(async (tx) => {
      const application = await tx.jobApplication.create({
        data: {
          jobId: createDto.jobId,
          workerId: worker.id,
          coverLetter: createDto.coverLetter,
        },
      });

      await tx.job.update({
        where: { id: createDto.jobId },
        data: { applicationCount: { increment: 1 } },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'CREATE',
          resourceType: 'JobApplication',
          resourceId: application.id,
        },
      });

      return application;
    });
  }

  async checkApplicationStatus(userId: string, jobId: string) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!worker) {
      return { applied: false };
    }

    const existingApp = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_workerId: {
          jobId,
          workerId: worker.id,
        },
      },
    });

    return { applied: !!existingApp, applicationId: existingApp?.id };
  }

  async getMyApplications(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!worker) {
      throw new ForbiddenException('Only workers can view their applications');
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where: { workerId: worker.id },
        include: {
          job: {
            include: {
              employer: {
                select: { companyName: true, logoUrl: true },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.jobApplication.count({
        where: { workerId: worker.id },
      }),
    ]);

    return {
      items: applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getApplicationsForJob(
    userId: string,
    jobId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException('Only employers can view job applications');
    }

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.employerId !== employer.id) {
      throw new ForbiddenException(
        'You do not have permission to view these applications',
      );
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where: { jobId },
        include: {
          worker: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
              rating: true,
              skills: { include: { skill: true } },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.jobApplication.count({
        where: { jobId },
      }),
    ]);

    return {
      items: applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecentApplications(userId: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException(
        'Only employers can view their recent applications',
      );
    }

    return this.prisma.jobApplication.findMany({
      where: { job: { employerId: employer.id } },
      include: {
        worker: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
      take: 5,
    });
  }

  async updateApplicationStatus(
    userId: string,
    applicationId: string,
    updateDto: UpdateApplicationStatusDto,
  ) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException(
        'Only employers can update application status',
      );
    }

    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.employerId !== employer.id) {
      throw new ForbiddenException(
        'You do not have permission to update this application',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Re-fetch job inside transaction with explicit lock (for isolation if we switch to serializable/forUpdate)
      const currentJob = await tx.job.findUnique({
        where: { id: application.jobId },
      });

      if (!currentJob) throw new NotFoundException('Job not found');

      let positionsChange = 0;

      if (
        updateDto.status === 'ACCEPTED' &&
        application.status !== 'ACCEPTED'
      ) {
        if (currentJob.positionsFilled >= currentJob.positionsTotal) {
          throw new ConflictException(
            'Cannot accept: job positions are already full',
          );
        }
        positionsChange = 1;
      } else if (
        application.status === 'ACCEPTED' &&
        updateDto.status !== 'ACCEPTED'
      ) {
        positionsChange = -1;
      }

      const updated = await tx.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: updateDto.status,
          employerNote: updateDto.employerNote,
        },
      });

      if (positionsChange !== 0) {
        await tx.job.update({
          where: { id: currentJob.id },
          data: { positionsFilled: { increment: positionsChange } },
        });
      }

      // If newly accepted, create a shift (assuming one shift per job for MVP)

      if (
        updateDto.status === 'ACCEPTED' &&
        application.status !== 'ACCEPTED'
      ) {
        const scheduledEnd =
          currentJob.endDate ||
          new Date(
            currentJob.startDate.getTime() +
              (Number(currentJob.shiftDurationHours) || 8) * 3600000,
          );

        // Check if shift already exists to prevent duplicate shift creation race conditions
        const existingShift = await tx.shift.findFirst({
          where: { jobId: currentJob.id, workerId: application.workerId },
        });

        if (!existingShift) {
          await tx.shift.create({
            data: {
              jobId: currentJob.id,
              applicationId: application.id,
              workerId: application.workerId,
              scheduledStart: currentJob.startDate,
              scheduledEnd: scheduledEnd,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'UPDATE',
          resourceType: 'JobApplication',
          resourceId: applicationId,
          newValues: { status: updateDto.status },
        },
      });

      return updated;
    });
  }
}
