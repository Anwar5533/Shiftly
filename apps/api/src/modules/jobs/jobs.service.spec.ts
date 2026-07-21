import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JobStatus } from '@prisma/client';

describe('JobsService', () => {
  let service: JobsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      employerProfile: {
        findUnique: jest.fn(),
      },
      job: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (args) => {
        if (Array.isArray(args)) {
          return Promise.all(args);
        }
        if (typeof args === 'function') {
          // Pass the prisma mock itself as the transaction object
          return args(prisma);
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [JobsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  describe('createJob', () => {
    it('should throw ForbiddenException if user is not employer', async () => {
      prisma.employerProfile.findUnique.mockResolvedValue(null);
      await expect(service.createJob('user-1', {} as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw InternalServerErrorException if creation fails', async () => {
      prisma.employerProfile.findUnique.mockResolvedValue({ id: 'emp-1' });
      prisma.job.create.mockRejectedValue(new Error());
      await expect(service.createJob('user-1', {} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should create job', async () => {
      prisma.employerProfile.findUnique.mockResolvedValue({ id: 'emp-1' });
      prisma.job.create.mockResolvedValue({ id: 'job-1' });
      const result = await service.createJob('user-1', {} as any);
      expect(result.id).toBe('job-1');
      expect(prisma.job.create).toHaveBeenCalled();
    });
  });

  describe('searchJobs', () => {
    it('should search jobs with various filters', async () => {
      prisma.job.findMany.mockResolvedValue([{ id: 'job-1' }]);
      prisma.job.count.mockResolvedValue(1);

      const result = await service.searchJobs({
        query: 'developer',
        jobType: 'FULL_TIME',
        status: JobStatus.PUBLISHED,
        city: 'New York',
        minSalary: 50000,
        page: 1,
        limit: 10,
      } as any);

      expect(prisma.job.findMany).toHaveBeenCalled();
      expect(result.items.length).toBe(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should handle pagination', async () => {
      prisma.job.findMany.mockResolvedValue([]);
      prisma.job.count.mockResolvedValue(0);

      const result = await service.searchJobs({
        page: 2,
        limit: 5,
      });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });
  });

  describe('getJobById', () => {
    it('should throw NotFoundException if job not found', async () => {
      prisma.job.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.getJobById('job-1')).rejects.toThrow(
        require('@nestjs/common').NotFoundException,
      );
    });

    it('should return job if found', async () => {
      prisma.job.findUnique = jest.fn().mockResolvedValue({ id: 'job-1' });
      const result = await service.getJobById('job-1');
      expect(result.id).toBe('job-1');
    });
  });

  describe('closeJob', () => {
    it('should throw ForbiddenException if user is not employer', async () => {
      prisma.employerProfile.findUnique.mockResolvedValue(null);
      await expect(service.closeJob('user-1', 'job-1')).rejects.toThrow(
        require('@nestjs/common').ForbiddenException,
      );
    });

    it('should throw NotFoundException if job not found', async () => {
      prisma.employerProfile.findUnique.mockResolvedValue({ id: 'emp-1' });
      prisma.job.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.closeJob('user-1', 'job-1')).rejects.toThrow(
        require('@nestjs/common').NotFoundException,
      );
    });

    it('should throw ForbiddenException if job employerId does not match user employerId', async () => {
      prisma.employerProfile.findUnique.mockResolvedValue({ id: 'emp-1' });
      prisma.job.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'job-1', employerId: 'emp-2' });
      await expect(service.closeJob('user-1', 'job-1')).rejects.toThrow(
        require('@nestjs/common').ForbiddenException,
      );
    });

    it('should update job status to FILLED', async () => {
      prisma.employerProfile.findUnique.mockResolvedValue({ id: 'emp-1' });
      prisma.job.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'job-1', employerId: 'emp-1' });
      prisma.job.update = jest
        .fn()
        .mockResolvedValue({ id: 'job-1', status: 'FILLED' });

      const result = await service.closeJob('user-1', 'job-1');
      expect(prisma.job.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: { status: 'FILLED' },
      });
      expect(result.status).toBe('FILLED');
    });
  });
});
