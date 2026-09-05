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
import { KafkaTopics, ApplicationApprovedEventSchema } from '@shiftly/shared-events';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async getWorkerId(userId: string): Promise<string> {
    const res = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM workers.worker_profiles WHERE "userId" = ${userId}::uuid LIMIT 1
    `;
    if (!res || res.length === 0) {
      throw new ForbiddenException('User is not a worker');
    }
    return res[0].id;
  }

  private async getEmployerId(userId: string): Promise<string> {
    const res = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM employers.employer_profiles WHERE "userId" = ${userId}::uuid LIMIT 1
    `;
    if (!res || res.length === 0) {
      throw new ForbiddenException('User is not an employer');
    }
    return res[0].id;
  }

  async applyToJob(userId: string, createDto: CreateApplicationDto) {
    const workerProfileId = await this.getWorkerId(userId);
    
    // Fetch employerId from jobs table
    const jobRes = await this.prisma.$queryRaw<{ employerId: string }[]>`
      SELECT "employerId" FROM jobs.jobs WHERE id = ${createDto.jobId}::uuid LIMIT 1
    `;
    if (!jobRes || jobRes.length === 0) {
      throw new NotFoundException('Job not found');
    }
    const jobEmployerId = jobRes[0].employerId;

    const existingApp = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_workerId: {
          jobId: createDto.jobId,
          workerId: workerProfileId,
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
          workerId: workerProfileId,
          employerId: jobEmployerId,
          coverLetter: createDto.coverLetter,
        },
      });

      // TODO: Emit event to jobs-service to increment application count
      this.eventEmitter.emit('job.application.created', { jobId: createDto.jobId });

      return application;
    });
  }

  async checkApplicationStatus(userId: string, jobId: string) {
    const workerProfileId = await this.getWorkerId(userId);
    const existingApp = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_workerId: {
          jobId,
          workerId: workerProfileId,
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
    const workerProfileId = await this.getWorkerId(userId);
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where: { workerId: workerProfileId },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
        include: { job: true },
      }),
      this.prisma.jobApplication.count({
        where: { workerId: workerProfileId },
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
    const employerProfileId = await this.getEmployerId(userId);
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where: { jobId, employerId: employerProfileId },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
        include: { job: true, worker: true },
      }),
      this.prisma.jobApplication.count({
        where: { jobId, employerId: employerProfileId },
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
    const employerProfileId = await this.getEmployerId(userId);
    return this.prisma.jobApplication.findMany({
      where: { employerId: employerProfileId },
      orderBy: { appliedAt: 'desc' },
      take: 5,
      include: { job: true },
    });
  }

  async updateApplicationStatus(
    userId: string,
    applicationId: string,
    updateDto: UpdateApplicationStatusDto,
  ) {
    const employerProfileId = await this.getEmployerId(userId);
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.employerId !== employerProfileId) {
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
        const eventPayload = ApplicationApprovedEventSchema.parse({
          eventId: crypto.randomUUID(),
          traceId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          version: '1.0',
          type: 'application.approved',
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
    const workerProfileId = await this.getWorkerId(userId);
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.workerId !== workerProfileId) {
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
