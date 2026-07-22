/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  let controller: JobsController;
  let jobsService: any;

  beforeEach(async () => {
    jobsService = {
      createJob: jest.fn(),
      searchJobs: jest.fn(),
      getJobById: jest.fn(),
      closeJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      providers: [{ provide: JobsService, useValue: jobsService }],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  describe('createJob', () => {
    it('should call createJob', async () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      await controller.createJob('user-1', { title: 'Test' } as any);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(jobsService.createJob).toHaveBeenCalledWith('user-1', {
        title: 'Test',
      });
    });
  });

  describe('searchJobs', () => {
    it('should call searchJobs', async () => {
      await controller.searchJobs({ query: 'dev' });
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(jobsService.searchJobs).toHaveBeenCalledWith({ query: 'dev' });
    });
  });

  describe('getJobById', () => {
    it('should call getJobById', async () => {
      await controller.getJobById('job-1');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(jobsService.getJobById).toHaveBeenCalledWith('job-1');
    });
  });

  describe('closeJob', () => {
    it('should call closeJob', async () => {
      await controller.closeJob('user-1', 'job-1');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(jobsService.closeJob).toHaveBeenCalledWith('user-1', 'job-1');
    });
  });
});
