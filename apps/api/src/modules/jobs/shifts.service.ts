import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async clockIn(userId: string, shiftId: string, location: any) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });
    if (!worker)
      throw new ForbiddenException('Only workers can clock into shifts');

    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });
    if (!shift) throw new NotFoundException('Shift not found');

    if (shift.workerId !== worker.id) {
      throw new ForbiddenException('This is not your shift');
    }

    if (shift.status !== 'SCHEDULED') {
      throw new BadRequestException(
        `Cannot clock into shift with status ${shift.status}`,
      );
    }

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: 'IN_PROGRESS',
        actualStart: new Date(),
        clockInLocation: location || {},
      },
      include: {
        job: true,
        worker: true,
      },
    });
  }

  async clockOut(
    userId: string,
    shiftId: string,
    location: any,
    notes?: string,
  ) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });
    if (!worker)
      throw new ForbiddenException('Only workers can clock out of shifts');

    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });
    if (!shift) throw new NotFoundException('Shift not found');

    if (shift.workerId !== worker.id) {
      throw new ForbiddenException('This is not your shift');
    }

    if (shift.status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        `Cannot clock out of shift with status ${shift.status}`,
      );
    }

    const actualEnd = new Date();
    const actualStart = shift.actualStart!;

    // Calculate hours worked
    const diffMs = actualEnd.getTime() - actualStart.getTime();
    const hoursWorked = diffMs / (1000 * 60 * 60);

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: 'COMPLETED',
        actualEnd: actualEnd,
        clockOutLocation: location || {},
        hoursWorked: parseFloat(hoursWorked.toFixed(2)),
        notes: notes,
      },
      include: {
        job: true,
        worker: true,
      },
    });
  }

  async getMyShifts(userId: string) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });
    if (!worker)
      throw new ForbiddenException('Only workers can view their shifts');

    return this.prisma.shift.findMany({
      where: { workerId: worker.id },
      include: {
        job: {
          include: {
            employer: { select: { companyName: true } },
          },
        },
      },
      orderBy: { scheduledStart: 'asc' },
    });
  }
}
