import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { TimesheetStatus } from '@prisma/client-jobs-service';
import { KafkaTopics, ShiftCompletedEventSchema } from '@shiftly/shared-events';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getWorkerProfileId(userId: string): Promise<string | null> {
    try {
      const res = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM workers.worker_profiles WHERE "userId" = ${userId}::uuid LIMIT 1
      `;
      return res && res.length > 0 ? res[0].id : null;
    } catch {
      return null;
    }
  }

  private async getEmployerProfileId(userId: string): Promise<string | null> {
    try {
      const res = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM employers.employer_profiles WHERE "userId" = ${userId}::uuid LIMIT 1
      `;
      return res && res.length > 0 ? res[0].id : null;
    } catch {
      return null;
    }
  }

  async getMyShifts(userId: string) {
    const workerProfileId = await this.getWorkerProfileId(userId);
    const workerIds = workerProfileId ? [userId, workerProfileId] : [userId];

    return this.prisma.shift.findMany({
      where: { workerId: { in: workerIds } },
      include: { job: true, timesheet: true },
      orderBy: { scheduledStart: 'asc' },
    });
  }

  /**
   * Enforces that the requesting user is either:
   *   (a) the assigned worker for the shift (via User.id or WorkerProfile.id), OR
   *   (b) the employer who owns the parent job (via User.id or EmployerProfile.id).
   * Any other authenticated user receives a 403 ForbiddenException.
   */
  async getShiftById(shiftId: string, userId: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: { job: true, timesheet: true },
    });

    if (!shift) throw new NotFoundException('Shift not found');

    const workerProfileId = await this.getWorkerProfileId(userId);
    const employerProfileId = await this.getEmployerProfileId(userId);

    const isAssignedWorker =
      shift.workerId === userId || (workerProfileId !== null && shift.workerId === workerProfileId);
    const isOwningEmployer =
      shift.job.employerId === userId ||
      (employerProfileId !== null && shift.job.employerId === employerProfileId);

    if (!isAssignedWorker && !isOwningEmployer) {
      throw new ForbiddenException('You do not have permission to view this shift.');
    }

    return shift;
  }

  async clockIn(shiftId: string, userId: string, location?: Record<string, unknown>) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    const workerProfileId = await this.getWorkerProfileId(userId);
    const isAssignedWorker =
      shift.workerId === userId || (workerProfileId !== null && shift.workerId === workerProfileId);

    if (!isAssignedWorker) {
      throw new BadRequestException('Invalid shift for worker');
    }

    if (shift.status !== 'SCHEDULED') {
      throw new BadRequestException('Cannot clock into this shift');
    }

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: 'IN_PROGRESS',
        actualStart: new Date(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        clockInLocation: (location || {}) as any,
      },
    });
  }

  async clockOut(shiftId: string, userId: string, location?: Record<string, unknown>) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    const workerProfileId = await this.getWorkerProfileId(userId);
    const isAssignedWorker =
      shift.workerId === userId || (workerProfileId !== null && shift.workerId === workerProfileId);

    if (!isAssignedWorker) {
      throw new BadRequestException('Invalid shift for worker');
    }

    if (shift.status !== 'IN_PROGRESS' || !shift.actualStart) {
      throw new BadRequestException('Cannot clock out. Shift is not in progress.');
    }

    const actualEnd = new Date();
    const hoursWorked = (actualEnd.getTime() - shift.actualStart.getTime()) / (1000 * 60 * 60);

    return this.prisma.$transaction(async (tx) => {
      const updatedShift = await tx.shift.update({
        where: { id: shiftId },
        data: {
          status: 'COMPLETED',
          actualEnd,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          clockOutLocation: (location || {}) as any,
          hoursWorked,
        },
      });

      const validatedEvent = ShiftCompletedEventSchema.parse({
        eventId: crypto.randomUUID(),
        traceId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: '1.0',
        type: 'shift.completed',
        payload: {
          shiftId: updatedShift.id,
          jobId: updatedShift.jobId,
          workerId: updatedShift.workerId,
        },
      });

      await tx.outboxEvent.create({
        data: {
          topic: KafkaTopics.Jobs,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          payload: validatedEvent as any,
        },
      });

      return updatedShift;
    });
  }

  async submitTimesheet(shiftId: string, userId: string, notes?: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: { timesheet: true, job: true },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    const workerProfileId = await this.getWorkerProfileId(userId);
    const isAssignedWorker =
      shift.workerId === userId || (workerProfileId !== null && shift.workerId === workerProfileId);

    if (!isAssignedWorker) {
      throw new ForbiddenException(
        'You do not have permission to submit a timesheet for this shift.',
      );
    }

    if (shift.status !== 'COMPLETED' && shift.status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Shift must be in progress or completed to submit a timesheet.',
      );
    }

    const hours =
      shift.hoursWorked ??
      (shift.actualStart
        ? ((shift.actualEnd || new Date()).getTime() - shift.actualStart.getTime()) /
          (1000 * 60 * 60)
        : 0);

    if (shift.timesheet) {
      if (shift.timesheet.status === TimesheetStatus.APPROVED) {
        throw new BadRequestException('Timesheet has already been approved.');
      }

      return this.prisma.timesheet.update({
        where: { id: shift.timesheet.id },
        data: {
          status: TimesheetStatus.SUBMITTED,
          hoursWorked: hours,
          notes: notes || shift.timesheet.notes,
          submittedAt: new Date(),
        },
      });
    }

    return this.prisma.timesheet.create({
      data: {
        shiftId: shift.id,
        status: TimesheetStatus.SUBMITTED,
        hoursWorked: hours,
        notes,
        submittedAt: new Date(),
      },
    });
  }

  async getMyTimesheets(userId: string) {
    const workerProfileId = await this.getWorkerProfileId(userId);
    const workerIds = workerProfileId ? [userId, workerProfileId] : [userId];

    return this.prisma.timesheet.findMany({
      where: {
        shift: {
          workerId: { in: workerIds },
        },
      },
      include: {
        shift: {
          include: { job: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTimesheetsForEmployer(userId: string) {
    const employerProfileId = await this.getEmployerProfileId(userId);
    const employerIds = employerProfileId ? [userId, employerProfileId] : [userId];

    return this.prisma.timesheet.findMany({
      where: {
        shift: {
          job: {
            employerId: { in: employerIds },
          },
        },
      },
      include: {
        shift: {
          include: { job: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveTimesheet(timesheetId: string, userId: string) {
    const timesheet = await this.prisma.timesheet.findUnique({
      where: { id: timesheetId },
      include: {
        shift: {
          include: { job: true },
        },
      },
    });

    if (!timesheet) {
      throw new NotFoundException('Timesheet not found');
    }

    const employerProfileId = await this.getEmployerProfileId(userId);
    const isOwningEmployer =
      timesheet.shift.job.employerId === userId ||
      (employerProfileId !== null && timesheet.shift.job.employerId === employerProfileId);

    if (!isOwningEmployer) {
      throw new ForbiddenException('You do not own the job linked to this timesheet.');
    }

    if (timesheet.status === TimesheetStatus.APPROVED) {
      return timesheet;
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedTimesheet = await tx.timesheet.update({
        where: { id: timesheet.id },
        data: {
          status: TimesheetStatus.APPROVED,
          approvedAt: new Date(),
        },
      });

      // Ensure shift is marked COMPLETED if not already
      if (timesheet.shift.status !== 'COMPLETED') {
        const actualEnd = timesheet.shift.actualEnd || new Date();
        const actualStart = timesheet.shift.actualStart || timesheet.shift.scheduledStart;
        const hoursWorked =
          timesheet.hoursWorked || (actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60);

        await tx.shift.update({
          where: { id: timesheet.shift.id },
          data: {
            status: 'COMPLETED',
            actualEnd,
            hoursWorked,
          },
        });

        const validatedEvent = ShiftCompletedEventSchema.parse({
          eventId: crypto.randomUUID(),
          traceId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          version: '1.0',
          type: 'shift.completed',
          payload: {
            shiftId: timesheet.shift.id,
            jobId: timesheet.shift.jobId,
            workerId: timesheet.shift.workerId,
          },
        });

        await tx.outboxEvent.create({
          data: {
            topic: KafkaTopics.Jobs,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            payload: validatedEvent as any,
          },
        });
      }

      return updatedTimesheet;
    });
  }

  async rejectTimesheet(timesheetId: string, userId: string, reason: string) {
    const timesheet = await this.prisma.timesheet.findUnique({
      where: { id: timesheetId },
      include: {
        shift: {
          include: { job: true },
        },
      },
    });

    if (!timesheet) {
      throw new NotFoundException('Timesheet not found');
    }

    const employerProfileId = await this.getEmployerProfileId(userId);
    const isOwningEmployer =
      timesheet.shift.job.employerId === userId ||
      (employerProfileId !== null && timesheet.shift.job.employerId === employerProfileId);

    if (!isOwningEmployer) {
      throw new ForbiddenException('You do not own the job linked to this timesheet.');
    }

    return this.prisma.timesheet.update({
      where: { id: timesheet.id },
      data: {
        status: TimesheetStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }
}
