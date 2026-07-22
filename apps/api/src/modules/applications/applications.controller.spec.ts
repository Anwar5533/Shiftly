/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationStatus } from '@prisma/client';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let service: jest.Mocked<ApplicationsService>;

  beforeEach(async () => {
    const mockService = {
      applyToJob: jest.fn(),
      getMyApplications: jest.fn(),
      getApplicationsForJob: jest.fn(),
      updateApplicationStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [{ provide: ApplicationsService, useValue: mockService }],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    service = module.get(ApplicationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call applyToJob', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    service.applyToJob.mockResolvedValue({ id: '1' } as any);
    const result = await controller.applyToJob('user1', { jobId: 'job1' });
    expect(result).toEqual({ id: '1' });
    // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
    expect(service.applyToJob).toHaveBeenCalledWith('user1', { jobId: 'job1' });
  });

  it('should call updateApplicationStatus', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    service.updateApplicationStatus.mockResolvedValue({
      id: '1',
      status: ApplicationStatus.ACCEPTED,
    } as any);
    const result = await controller.updateApplicationStatus('user1', '1', {
      status: ApplicationStatus.ACCEPTED,
    });
    expect(result).toEqual({ id: '1', status: ApplicationStatus.ACCEPTED });
    // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
    expect(service.updateApplicationStatus).toHaveBeenCalledWith('user1', '1', {
      status: ApplicationStatus.ACCEPTED,
    });
  });
});
