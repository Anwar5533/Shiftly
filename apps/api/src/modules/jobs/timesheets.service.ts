/* eslint-disable @typescript-eslint/no-unused-vars, prettier/prettier -- TODO(RC3): Address type safety */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { EscrowService } from '../payments/escrow/escrow.service';
import { TimesheetStatus } from '@shiftly/shared-types';

@Injectable()
export class TimesheetsService {
  private readonly logger = new Logger(TimesheetsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly escrowService: EscrowService,
  ) {}

  async submitTimesheet(
    shiftId: string,
    workerId: string,
    hoursWorked: number,
    notes?: string,
  ) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: { timesheet: true },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.workerId !== workerId) {
      throw new ForbiddenException(
        'Not authorized to submit timesheet for this shift',
      );
    }

    if (shift.timesheet) {
      return this.prisma.timesheet.update({
        where: { id: shift.timesheet.id },
        data: {
          hoursWorked,
          notes,
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });
    }

    return this.prisma.timesheet.create({
      data: {
        shiftId,
        hoursWorked,
        notes,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
  }

  async getTimesheetsForEmployer(employerId: string) {
    return this.prisma.timesheet.findMany({
      where: {
        shift: {
          job: {
            employerId,
          },
        },
      },
      include: {
        shift: {
          include: {
            worker: {
              include: {
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            job: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async approveTimesheet(timesheetId: string, employerId: string) {
    const timesheet = await this.prisma.timesheet.findUnique({
      where: { id: timesheetId },
      include: {
        shift: {
          include: { job: true },
        },
      },
    });

    if (!timesheet) throw new NotFoundException('Timesheet not found');
    if (timesheet.shift.job.employerId !== employerId) {
      throw new ForbiddenException('Not authorized to approve this timesheet');
    }

    const updatedTimesheet = await this.prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    try {
      await this.escrowService.releaseFunds(updatedTimesheet.id);
    } catch (error) {
      this.logger.error(
        `Failed to release escrow funds for timesheet ${timesheetId}:`,
        error,
      );
    }

    return updatedTimesheet;
  }

  async rejectTimesheet(
    timesheetId: string,
    employerId: string,
    rejectionReason: string,
  ) {
    const timesheet = await this.prisma.timesheet.findUnique({
      where: { id: timesheetId },
      include: { shift: { include: { job: true } } },
    });

    if (!timesheet) throw new NotFoundException('Timesheet not found');
    if (timesheet.shift.job.employerId !== employerId) {
      throw new ForbiddenException('Not authorized to reject this timesheet');
    }

    return this.prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason,
      },
    });
  }
}
