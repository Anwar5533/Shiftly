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
    // Only mock models that exist in applications-service schema: jobApplication, outboxEvent
    const mockPrismaService: any = {
      jobApplication: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      outboxEvent: {
        create: jest.fn(),
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- transaction callback passthrough
      $transaction: jest.fn((callback) => {
        if (typeof callback === 'function') {
          return callback(mockPrismaService);
        }
        // Array form (batch transactions)
        return Promise.all(callback);
      }),
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
    it('should throw ConflictException if user already applied', async () => {
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue({ id: 'app1' });
      await expect(service.applyToJob('user1', { jobId: 'job1' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create an application successfully', async () => {
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue(null);

      const newApp = {
        id: 'app1',
        jobId: 'job1',
        workerId: 'user1',
        status: ApplicationStatus.PENDING,
      };
      (prismaService.jobApplication.create as jest.Mock).mockResolvedValue(newApp);

      const result = await service.applyToJob('user1', { jobId: 'job1' });
      expect(result).toEqual(newApp);
      expect(eventEmitter.emit).toHaveBeenCalledWith('job.application.created', { jobId: 'job1' });
    });
  });

  describe('checkApplicationStatus', () => {
    it('should return applied: false when no application exists', async () => {
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await service.checkApplicationStatus('user1', 'job1');
      expect(result.applied).toBe(false);
      expect(result.applicationId).toBeUndefined();
    });

    it('should return applied: true with status when application exists', async () => {
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue({
        id: 'app1',
        status: ApplicationStatus.PENDING,
      });
      const result = await service.checkApplicationStatus('user1', 'job1');
      expect(result.applied).toBe(true);
      expect(result.applicationId).toBe('app1');
      expect(result.status).toBe(ApplicationStatus.PENDING);
    });
  });

  describe('updateApplicationStatus', () => {
    it('should throw NotFoundException if application not found', async () => {
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateApplicationStatus('emp1', 'app1', { status: ApplicationStatus.ACCEPTED }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the employer', async () => {
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue({
        id: 'app1',
        employerId: 'different-employer',
        status: ApplicationStatus.PENDING,
      });
      await expect(
        service.updateApplicationStatus('emp1', 'app1', { status: ApplicationStatus.ACCEPTED }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update application status', async () => {
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue({
        id: 'app1',
        employerId: 'emp1',
        workerId: 'worker1',
        jobId: 'job1',
        status: ApplicationStatus.PENDING,
      });
      (prismaService.jobApplication.update as jest.Mock).mockResolvedValue({
        id: 'app1',
        status: ApplicationStatus.SHORTLISTED,
      });

      const result = await service.updateApplicationStatus('emp1', 'app1', {
        status: ApplicationStatus.SHORTLISTED,
      });
      expect(result.status).toBe(ApplicationStatus.SHORTLISTED);
    });
  });

  describe('withdrawApplication', () => {
    it('should throw NotFoundException if application not found', async () => {
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.withdrawApplication('user1', 'app1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the worker', async () => {
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue({
        id: 'app1',
        workerId: 'different-worker',
        status: ApplicationStatus.PENDING,
      });
      await expect(service.withdrawApplication('user1', 'app1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if application is already accepted', async () => {
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue({
        id: 'app1',
        workerId: 'user1',
        status: ApplicationStatus.ACCEPTED,
      });
      await expect(service.withdrawApplication('user1', 'app1')).rejects.toThrow(ConflictException);
    });

    it('should withdraw application successfully', async () => {
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue({
        id: 'app1',
        workerId: 'user1',
        jobId: 'job1',
        status: ApplicationStatus.PENDING,
      });
      (prismaService.jobApplication.update as jest.Mock).mockResolvedValue({
        id: 'app1',
        status: ApplicationStatus.WITHDRAWN,
      });

      const result = await service.withdrawApplication('user1', 'app1');
      expect(result.status).toBe(ApplicationStatus.WITHDRAWN);
      expect(eventEmitter.emit).toHaveBeenCalledWith('job.application.withdrawn', {
        jobId: 'job1',
      });
    });
  });
});
