/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsService } from './shifts.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TimesheetStatus } from '@prisma/client-jobs-service';

describe('ShiftsService', () => {
  let service: ShiftsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) => {
        return callback(prisma);
      }),
      $queryRaw: jest.fn(),
      shift: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      timesheet: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      outboxEvent: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ShiftsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ShiftsService>(ShiftsService);
  });

  describe('getMyShifts', () => {
    it('should resolve workerProfileId and query shifts for worker', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 'worker-prof-1' }]);
      prisma.shift.findMany.mockResolvedValue([{ id: 'shift-1' }]);

      const result = await service.getMyShifts('user-1');

      expect(prisma.shift.findMany).toHaveBeenCalledWith({
        where: { workerId: { in: ['user-1', 'worker-prof-1'] } },
        include: { job: true, timesheet: true },
        orderBy: { scheduledStart: 'asc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getShiftById', () => {
    it('should throw NotFoundException if shift not found', async () => {
      prisma.shift.findUnique.mockResolvedValue(null);
      await expect(service.getShiftById('shift-1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should allow assigned worker to view shift', async () => {
      prisma.shift.findUnique.mockResolvedValue({
        id: 'shift-1',
        workerId: 'worker-prof-1',
        job: { employerId: 'emp-prof-1' },
      });
      prisma.$queryRaw.mockResolvedValueOnce([{ id: 'worker-prof-1' }]); // worker check

      const result = await service.getShiftById('shift-1', 'user-1');
      expect(result.id).toBe('shift-1');
    });

    it('should allow owning employer to view shift', async () => {
      prisma.shift.findUnique.mockResolvedValue({
        id: 'shift-1',
        workerId: 'worker-prof-1',
        job: { employerId: 'emp-prof-1' },
      });
      prisma.$queryRaw.mockResolvedValueOnce([]); // worker check
      prisma.$queryRaw.mockResolvedValueOnce([{ id: 'emp-prof-1' }]); // employer check

      const result = await service.getShiftById('shift-1', 'emp-user-1');
      expect(result.id).toBe('shift-1');
    });

    it('should throw ForbiddenException if user is neither worker nor employer', async () => {
      prisma.shift.findUnique.mockResolvedValue({
        id: 'shift-1',
        workerId: 'worker-prof-1',
        job: { employerId: 'emp-prof-1' },
      });
      prisma.$queryRaw.mockResolvedValue([]);

      await expect(service.getShiftById('shift-1', 'unrelated-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('clockIn', () => {
    it('should clock in successfully for assigned worker', async () => {
      prisma.shift.findUnique.mockResolvedValue({
        id: 'shift-1',
        workerId: 'worker-prof-1',
        status: 'SCHEDULED',
      });
      prisma.$queryRaw.mockResolvedValue([{ id: 'worker-prof-1' }]);
      prisma.shift.update.mockResolvedValue({
        id: 'shift-1',
        status: 'IN_PROGRESS',
      });

      const result = await service.clockIn('shift-1', 'user-1', { lat: 12.97, lng: 77.59 });
      expect(result.status).toBe('IN_PROGRESS');
      expect(prisma.shift.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'shift-1' },
          data: expect.objectContaining({ status: 'IN_PROGRESS' }),
        }),
      );
    });

    it('should throw BadRequestException if user is not assigned worker', async () => {
      prisma.shift.findUnique.mockResolvedValue({
        id: 'shift-1',
        workerId: 'worker-prof-1',
        status: 'SCHEDULED',
      });
      prisma.$queryRaw.mockResolvedValue([]);

      await expect(service.clockIn('shift-1', 'different-user')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('clockOut', () => {
    it('should clock out, mark shift completed, and create outbox event', async () => {
      const scheduledStart = new Date(Date.now() - 4 * 60 * 60 * 1000);
      prisma.shift.findUnique.mockResolvedValue({
        id: 'shift-1',
        jobId: 'job-1',
        workerId: 'worker-prof-1',
        status: 'IN_PROGRESS',
        actualStart: scheduledStart,
      });
      prisma.$queryRaw.mockResolvedValue([{ id: 'worker-prof-1' }]);
      prisma.shift.update.mockResolvedValue({
        id: 'shift-1',
        jobId: 'job-1',
        workerId: 'worker-prof-1',
        status: 'COMPLETED',
      });

      const result = await service.clockOut('shift-1', 'user-1');
      expect(result.status).toBe('COMPLETED');
      expect(prisma.outboxEvent.create).toHaveBeenCalled();
    });
  });

  describe('timesheet operations', () => {
    it('submitTimesheet should create a timesheet when worker submits', async () => {
      prisma.shift.findUnique.mockResolvedValue({
        id: 'shift-1',
        workerId: 'worker-prof-1',
        status: 'COMPLETED',
        hoursWorked: 8,
      });
      prisma.$queryRaw.mockResolvedValue([{ id: 'worker-prof-1' }]);
      prisma.timesheet.create.mockResolvedValue({
        id: 'ts-1',
        shiftId: 'shift-1',
        status: TimesheetStatus.SUBMITTED,
      });

      const result = await service.submitTimesheet('shift-1', 'user-1', 'Completed all tasks');
      expect(result.status).toBe(TimesheetStatus.SUBMITTED);
      expect(prisma.timesheet.create).toHaveBeenCalled();
    });

    it('approveTimesheet should approve timesheet and create outbox event', async () => {
      prisma.timesheet.findUnique.mockResolvedValue({
        id: 'ts-1',
        status: TimesheetStatus.SUBMITTED,
        hoursWorked: 8,
        shift: {
          id: 'shift-1',
          jobId: 'job-1',
          workerId: 'worker-prof-1',
          status: 'IN_PROGRESS',
          actualStart: new Date(),
          job: { employerId: 'emp-prof-1' },
        },
      });
      prisma.$queryRaw.mockResolvedValue([{ id: 'emp-prof-1' }]);
      prisma.timesheet.update.mockResolvedValue({
        id: 'ts-1',
        status: TimesheetStatus.APPROVED,
      });
      prisma.shift.update.mockResolvedValue({
        id: 'shift-1',
        status: 'COMPLETED',
      });

      const result = await service.approveTimesheet('ts-1', 'emp-user-1');
      expect(result.status).toBe(TimesheetStatus.APPROVED);
      expect(prisma.outboxEvent.create).toHaveBeenCalled();
    });

    it('rejectTimesheet should mark timesheet as rejected', async () => {
      prisma.timesheet.findUnique.mockResolvedValue({
        id: 'ts-1',
        status: TimesheetStatus.SUBMITTED,
        shift: {
          job: { employerId: 'emp-prof-1' },
        },
      });
      prisma.$queryRaw.mockResolvedValue([{ id: 'emp-prof-1' }]);
      prisma.timesheet.update.mockResolvedValue({
        id: 'ts-1',
        status: TimesheetStatus.REJECTED,
      });

      const result = await service.rejectTimesheet('ts-1', 'emp-user-1', 'Hours do not match');
      expect(result.status).toBe(TimesheetStatus.REJECTED);
    });
  });
});
