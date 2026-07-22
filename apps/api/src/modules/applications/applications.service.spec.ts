/* eslint-disable @typescript-eslint/no-unused-vars, prettier/prettier -- TODO(RC3): Address type safety */
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
    const mockPrismaService: any = {
      workerProfile: { findUnique: jest.fn() },
      employerProfile: { findUnique: jest.fn() },
      job: { findUnique: jest.fn(), update: jest.fn() },
      jobApplication: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      auditLog: { create: jest.fn() },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call -- TODO(RC3): Address type safety
      $transaction: jest.fn((callback) => callback(mockPrismaService)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
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
        status: 'PUBLISHED',
        deletedAt: null,
        positionsFilled: 0,
        positionsTotal: 10,
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
