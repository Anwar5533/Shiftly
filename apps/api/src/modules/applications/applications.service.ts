import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

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

    const job = await this.prisma.job.findUnique({ where: { id: createDto.jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const existingApp = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_workerId: {
          jobId: createDto.jobId,
          workerId: worker.id,
        }
      }
    });

    if (existingApp) {
      throw new ConflictException('You have already applied for this job');
    }

    return this.prisma.jobApplication.create({
      data: {
        jobId: createDto.jobId,
        workerId: worker.id,
        coverLetter: createDto.coverLetter,
      },
    });
  }

  async getMyApplications(userId: string) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!worker) {
      throw new ForbiddenException('Only workers can view their applications');
    }

    return this.prisma.jobApplication.findMany({
      where: { workerId: worker.id },
      include: {
        job: {
          include: {
            employer: {
              select: { companyName: true, logoUrl: true }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async getApplicationsForJob(userId: string, jobId: string) {
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
      throw new ForbiddenException('You do not have permission to view these applications');
    }

    return this.prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        worker: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            rating: true,
            skills: { include: { skill: true } }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async getRecentApplications(userId: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException('Only employers can view their recent applications');
    }

    return this.prisma.jobApplication.findMany({
      where: { job: { employerId: employer.id } },
      include: {
        worker: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        },
        job: {
          select: {
            title: true,
          }
        }
      },
      orderBy: { appliedAt: 'desc' },
      take: 5,
    });
  }

  async updateApplicationStatus(userId: string, applicationId: string, updateDto: UpdateApplicationStatusDto) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException('Only employers can update application status');
    }

    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.employerId !== employer.id) {
      throw new ForbiddenException('You do not have permission to update this application');
    }

    if (updateDto.status === 'ACCEPTED' && application.status !== 'ACCEPTED') {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.jobApplication.update({
          where: { id: applicationId },
          data: {
            status: updateDto.status,
            employerNote: updateDto.employerNote,
          },
        });

        const scheduledEnd = application.job.endDate || 
          new Date(application.job.startDate.getTime() + (Number(application.job.shiftDurationHours) || 8) * 3600000);

        await tx.shift.create({
          data: {
            jobId: application.jobId,
            applicationId: application.id,
            workerId: application.workerId,
            scheduledStart: application.job.startDate,
            scheduledEnd: scheduledEnd,
          }
        });

        // Also update positionsFilled
        await tx.job.update({
          where: { id: application.jobId },
          data: { positionsFilled: { increment: 1 } }
        });

        return updated;
      });
    }

    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: updateDto.status,
        employerNote: updateDto.employerNote,
      },
    });
  }
}
