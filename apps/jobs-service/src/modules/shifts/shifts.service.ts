/* eslint-disable @typescript-eslint/no-unused-vars -- TODO(RC3): Address type safety */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ShiftStatus } from '@prisma/client';
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

  async getShiftById(shiftId: string, userId: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: { job: true },
    });
    if (!shift) throw new BadRequestException('Shift not found');
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

  // eslint-disable-next-line @typescript-eslint/require-await
  async approveTimesheet(timesheetId: string, employerId: string) {
    throw new BadRequestException('Timesheet functionality is deprecated');
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async rejectTimesheet(timesheetId: string, employerId: string, reason: string) {
    throw new BadRequestException('Timesheet functionality is deprecated');
  }
}
