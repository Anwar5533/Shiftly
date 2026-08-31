/* eslint-disable @typescript-eslint/no-unused-vars -- TODO(RC3): Address type safety */
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ShiftStatus } from '@prisma/client-jobs-service';
import { KafkaTopics, ShiftCompletedEventSchema } from '@shiftly/shared-events';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyShifts(workerId: string) {
    return this.prisma.shift.findMany({
      where: { workerId: workerId },
      include: { job: true },
      orderBy: { scheduledStart: 'asc' },
    });
  }

  /**
   * SECURITY FIX — CRITICAL-02 (IDOR):
   * Previously returned any shift to any authenticated user without checking
   * ownership. Now enforces that the requesting user is either:
   *   (a) the assigned worker for the shift, OR
   *   (b) the employer who owns the parent job.
   * Any other authenticated user receives a 403 ForbiddenException.
   */
  async getShiftById(shiftId: string, userId: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: { job: true },
    });

    if (!shift) throw new NotFoundException('Shift not found');

    const isAssignedWorker = shift.workerId === userId;
    const isOwningEmployer = shift.job.employerId === userId;

    if (!isAssignedWorker && !isOwningEmployer) {
      throw new ForbiddenException('You do not have permission to view this shift.');
    }

    return shift;
  }

  async clockIn(shiftId: string, workerId: string, location?: any) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift || shift.workerId !== workerId) {
      throw new BadRequestException('Invalid shift');
    }

    if (shift.status !== 'SCHEDULED') {
      throw new BadRequestException('Cannot clock into this shift');
    }

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: 'IN_PROGRESS',
        actualStart: new Date(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        clockInLocation: location || {},
      },
    });
  }

  async clockOut(shiftId: string, workerId: string, location?: any) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift || shift.workerId !== workerId) {
      throw new BadRequestException('Invalid shift');
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
          clockOutLocation: location || {},
          hoursWorked: hoursWorked,
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

  // eslint-disable-next-line @typescript-eslint/require-await
  async submitTimesheet(shiftId: string, workerId: string, notes: string) {
    throw new BadRequestException('Timesheet functionality is deprecated');
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getTimesheetsForEmployer(employerId: string) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getMyTimesheets(workerId: string) {
    return [];
  }

  /**
   * SECURITY NOTE — CRITICAL-02:
   * Timesheet approval is deprecated and always throws. An ownership check
   * (employer owns the job linked to this timesheet) is documented here for
   * when this functionality is re-activated:
   *
   *   const timesheet = await prisma.timesheet.findUnique({ where: { id }, include: { shift: { include: { job: true } } } });
   *   if (!timesheet) throw new NotFoundException();
   *   if (timesheet.shift.job.employerId !== employerId) throw new ForbiddenException();
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async approveTimesheet(timesheetId: string, employerId: string) {
    throw new BadRequestException('Timesheet functionality is deprecated');
  }

  /**
   * SECURITY NOTE — CRITICAL-02:
   * See approveTimesheet above — same ownership pattern applies here.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async rejectTimesheet(timesheetId: string, employerId: string, reason: string) {
    throw new BadRequestException('Timesheet functionality is deprecated');
  }
}
