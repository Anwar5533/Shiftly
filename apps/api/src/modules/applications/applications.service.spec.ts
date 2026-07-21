import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      workerProfile: { findUnique: jest.fn() },
      employerProfile: { findUnique: jest.fn() },
      job: { findUnique: jest.fn() },
      jobApplication: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('applyToJob', () => {
    it('should throw ForbiddenException if user is not a worker', async () => {
      (prismaService.workerProfile.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(
        service.applyToJob('user1', { jobId: 'job1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create an application successfully', async () => {
      (prismaService.workerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'worker1',
      });
      (prismaService.job.findUnique as jest.Mock).mockResolvedValue({
        id: 'job1',
      });
      (prismaService.jobApplication.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const newApp = {
        id: 'app1',
        jobId: 'job1',
        workerId: 'worker1',
        status: ApplicationStatus.PENDING,
      };
      (prismaService.jobApplication.create as jest.Mock).mockResolvedValue(
        newApp,
      );

      const result = await service.applyToJob('user1', { jobId: 'job1' });
      expect(result).toEqual(newApp);
    });
  });
});
