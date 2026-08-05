/* eslint-disable @typescript-eslint/no-unused-vars -- TODO(RC3): Address type safety */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { Prisma } from '@prisma/client-applications-service';
import { KafkaTopics, ApplicationHiredEventSchema } from '@shiftly/shared-events';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async applyToJob(userId: string, createDto: CreateApplicationDto) {
    const existingApp = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_workerId: {
          jobId: createDto.jobId,
          workerId: userId,
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
          workerId: userId,
          employerId: userId, // TODO: Get actual employerId via gRPC from job service
          coverLetter: createDto.coverLetter,
        },
      });

      // TODO: Emit event to jobs-service to increment application count
      this.eventEmitter.emit('job.application.created', { jobId: createDto.jobId });

      return application;
    });
  }

  async checkApplicationStatus(userId: string, jobId: string) {
    const existingApp = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_workerId: {
          jobId,
          workerId: userId,
        },
      },
    });

    return {
      applied: !!existingApp,
      applicationId: existingApp?.id,
      status: existingApp?.status,
    };
  }

  async getMyApplications(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where: { workerId: userId },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.jobApplication.count({
        where: { workerId: userId },
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

  async getApplicationsForJob(userId: string, jobId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where: { jobId, employerId: userId },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.jobApplication.count({
        where: { jobId, employerId: userId },
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
    return this.prisma.jobApplication.findMany({
      where: { employerId: userId },
      orderBy: { appliedAt: 'desc' },
      take: 5,
    });
  }

  async updateApplicationStatus(
    userId: string,
    applicationId: string,
    updateDto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.employerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this application');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: updateDto.status,
          employerNote: updateDto.employerNote,
        },
      });

      // If newly accepted, create a shift (assuming one shift per job for MVP)
      if (updateDto.status === 'ACCEPTED' && application.status !== 'ACCEPTED') {
        const eventPayload = ApplicationHiredEventSchema.parse({
          eventId: crypto.randomUUID(),
          traceId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          version: '1.0',
          type: 'application.hired',
          payload: {
            applicationId: application.id,
            jobId: application.jobId,
            workerId: application.workerId,
            employerId: application.employerId,
          },
        });

        await tx.outboxEvent.create({
          data: {
            topic: KafkaTopics.Applications,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            payload: eventPayload as any,
          },
        });
      }

      return updated;
    });
  }

  async withdrawApplication(userId: string, applicationId: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.workerId !== userId) {
      throw new ForbiddenException('You do not have permission to withdraw this application');
    }

    if (application.status !== 'PENDING' && application.status !== 'SHORTLISTED') {
      if (application.status === 'ACCEPTED') {
        throw new ConflictException(
          'Employer has already approved your request, you are unable to withdraw it. Please check with the employer.',
        );
      }
      throw new ConflictException(
        'You can only withdraw applications that are Pending or Shortlisted',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: 'WITHDRAWN',
        },
      });

      // TODO: Emit event to jobs-service to decrement application count
      this.eventEmitter.emit('job.application.withdrawn', { jobId: application.jobId });

      return updated;
    });
  }
}
