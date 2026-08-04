/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prismaService: jest.Mocked<PrismaService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockPrismaService: any = {
      user: { findUnique: jest.fn() },
      workerProfile: { findUnique: jest.fn(), create: jest.fn() },
      employerProfile: { findUnique: jest.fn() },
      job: { findUnique: jest.fn(), update: jest.fn() },
      jobApplication: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      auditLog: { create: jest.fn() },
      notification: { create: jest.fn() },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
      $transaction: jest.fn((callback) => callback(mockPrismaService)),
    };
    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,

        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    prismaService = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('applyToJob', () => {
    it('should throw ForbiddenException if user is not a worker', async () => {
      (prismaService.workerProfile.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.applyToJob('user1', { jobId: 'job1' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should create an application successfully', async () => {
      (prismaService.workerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'worker1',
      });
      (prismaService.job.findUnique as jest.Mock).mockResolvedValue({
        id: 'job1',
        status: 'PUBLISHED',
        deletedAt: null,
        positionsFilled: 0,
        positionsTotal: 10,
        employer: { userId: 'different-user' },
      });
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue(null);

      const newApp = {
        id: 'app1',
        jobId: 'job1',
        workerId: 'worker1',
        status: ApplicationStatus.PENDING,
      };
      (prismaService.jobApplication.create as jest.Mock).mockResolvedValue(newApp);

      const result = await service.applyToJob('user1', { jobId: 'job1' });
      expect(result).toEqual(newApp);
    });
  });

  describe('withdrawApplication', () => {
    it('should throw ForbiddenException if user is not a worker', async () => {
      (prismaService.workerProfile.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.withdrawApplication('user1', 'app1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if application not found', async () => {
      (prismaService.workerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'worker1',
      });
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.withdrawApplication('user1', 'app1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if application is already accepted', async () => {
      (prismaService.workerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'worker1',
      });
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue({
        id: 'app1',
        workerId: 'worker1',
        status: ApplicationStatus.ACCEPTED,
        job: { id: 'job1', employerId: 'emp1' },
      });
      await expect(service.withdrawApplication('user1', 'app1')).rejects.toThrow(ConflictException);
    });

    it('should withdraw application successfully', async () => {
      (prismaService.workerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'worker1',
      });
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue({
        id: 'app1',
        workerId: 'worker1',
        jobId: 'job1',
        status: ApplicationStatus.PENDING,
        job: {
          id: 'job1',
          employerId: 'emp1',
          title: 'Test Job',
          employer: { userId: 'emp_user_id' },
        },
      });
      (prismaService.jobApplication.update as jest.Mock).mockResolvedValue({
        status: ApplicationStatus.WITHDRAWN,
      });

      const result = await service.withdrawApplication('user1', 'app1');
      expect(result.status).toBe(ApplicationStatus.WITHDRAWN);

      expect(prismaService.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'job1' },
          data: { applicationCount: { decrement: 1 } },
        }),
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith('notification.create', expect.any(Object));
    });
  });
});
