import { Test, TestingModule } from '@nestjs/testing';
import { RecruitersController } from './recruiters.controller';
import { RecruitersService } from './recruiters.service';

describe('RecruitersController', () => {
  let controller: RecruitersController;
  let service: jest.Mocked<RecruitersService>;

  beforeEach(async () => {
    const mockService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      getDashboardStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruitersController],
      providers: [{ provide: RecruitersService, useValue: mockService }],
    }).compile();

    controller = module.get<RecruitersController>(RecruitersController);
    service = module.get(RecruitersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getProfile', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    service.getProfile.mockResolvedValue({ id: '1' } as any);
    const result = await controller.getProfile('user1');
    expect(result).toEqual({ id: '1' });
    // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
    expect(service.getProfile).toHaveBeenCalledWith('user1');
  });

  it('should call updateProfile', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    service.updateProfile.mockResolvedValue({
      id: '1',
      firstName: 'Jane',
    } as any);
    const result = await controller.updateProfile('user1', {
      firstName: 'Jane',
    });
    expect(result).toEqual({ id: '1', firstName: 'Jane' });
    // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
    expect(service.updateProfile).toHaveBeenCalledWith('user1', {
      firstName: 'Jane',
    });
  });

  it('should call getDashboardStats', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    service.getDashboardStats.mockResolvedValue({ activeJobs: 5 } as any);
    const result = await controller.getDashboardStats('user1');
    expect(result).toEqual({ activeJobs: 5 });
    // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
    expect(service.getDashboardStats).toHaveBeenCalledWith('user1');
  });
});
