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
      providers: [{ provide: JobsService, useValue: jobsService }],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  describe('createJob', () => {
    it('should call createJob', async () => {
      await controller.createJob('user-1', { title: 'Test' } as any);
      expect(jobsService.createJob).toHaveBeenCalledWith('user-1', {
        title: 'Test',
      });
    });
  });

  describe('searchJobs', () => {
    it('should call searchJobs', async () => {
      await controller.searchJobs({ query: 'dev' });
      expect(jobsService.searchJobs).toHaveBeenCalledWith({ query: 'dev' });
    });
  });

  describe('getJobById', () => {
    it('should call getJobById', async () => {
      await controller.getJobById('job-1');
      expect(jobsService.getJobById).toHaveBeenCalledWith('job-1');
    });
  });

  describe('closeJob', () => {
    it('should call closeJob', async () => {
      await controller.closeJob('user-1', 'job-1');
      expect(jobsService.closeJob).toHaveBeenCalledWith('user-1', 'job-1');
    });
  });
});
