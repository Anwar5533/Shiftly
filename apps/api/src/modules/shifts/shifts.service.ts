import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ShiftStatus, TimesheetStatus } from '@prisma/client';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyShifts(workerId: string) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId: workerId }
    });
    if (!profile) throw new BadRequestException('Worker profile not found');

    return this.prisma.shift.findMany({
      where: { workerId: profile.id },
      include: { job: true, timesheet: true },
      orderBy: { scheduledStart: 'asc' }
    });
  }

  async getShiftById(shiftId: string, userId: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: { job: { include: { employer: true } }, timesheet: true }
    });
    if (!shift) throw new BadRequestException('Shift not found');
    return shift;
  }

  async clockIn(shiftId: string, workerId: string, location?: any) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId: workerId }});
    const shift = await this.prisma.shift.findUnique({ where: { id: shiftId }});
    
    if (!shift || !profile || shift.workerId !== profile.id) {
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
        clockInLocation: location || {}
      }
    });
  }

  async clockOut(shiftId: string, workerId: string, location?: any) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId: workerId }});
    const shift = await this.prisma.shift.findUnique({ where: { id: shiftId }});
    
    if (!shift || !profile || shift.workerId !== profile.id) {
      throw new BadRequestException('Invalid shift');
    }
    
    if (shift.status !== 'IN_PROGRESS' || !shift.actualStart) {
      throw new BadRequestException('Cannot clock out. Shift is not in progress.');
    }

    const actualEnd = new Date();
    const hoursWorked = (actualEnd.getTime() - shift.actualStart.getTime()) / (1000 * 60 * 60);

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: 'COMPLETED',
        actualEnd,
        clockOutLocation: location || {},
        hoursWorked: hoursWorked
      }
    });
  }

  async submitTimesheet(shiftId: string, workerId: string, notes: string) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId: workerId }});
    const shift = await this.prisma.shift.findUnique({ where: { id: shiftId }});
    
    if (!shift || !profile || shift.workerId !== profile.id) {
      throw new BadRequestException('Invalid shift');
    }
    if (shift.status !== 'COMPLETED' || !shift.hoursWorked) {
      throw new BadRequestException('Shift must be completed to submit a timesheet');
    }

    return this.prisma.timesheet.upsert({
      where: { shiftId: shift.id },
      create: {
        shiftId: shift.id,
        status: 'SUBMITTED',
        hoursWorked: shift.hoursWorked,
        notes,
        submittedAt: new Date()
      },
      update: {
        status: 'SUBMITTED',
        hoursWorked: shift.hoursWorked,
        notes,
        submittedAt: new Date()
      }
    });
  }

  async getTimesheetsForEmployer(employerId: string) {
    const profile = await this.prisma.employerProfile.findUnique({ where: { userId: employerId }});
    if (!profile) throw new BadRequestException('Employer profile not found');

    return this.prisma.timesheet.findMany({
      where: {
        shift: {
          job: {
            employerId: profile.id
          }
        }
      },
      include: {
        shift: {
          include: { worker: true, job: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMyTimesheets(workerId: string) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId: workerId }});
    if (!profile) throw new BadRequestException('Worker profile not found');

    return this.prisma.timesheet.findMany({
      where: {
        shift: {
          workerId: profile.id
        }
      },
      include: {
        shift: {
          include: { job: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approveTimesheet(timesheetId: string, employerId: string) {
    return this.prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
      }
    });
  }

  async rejectTimesheet(timesheetId: string, employerId: string, reason: string) {
    return this.prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason
      }
    });
  }
}
