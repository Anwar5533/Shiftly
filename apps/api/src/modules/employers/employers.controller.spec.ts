/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { EmployersController } from './employers.controller';
import { EmployersService } from './employers.service';

describe('EmployersController', () => {
  let controller: EmployersController;
  let service: jest.Mocked<EmployersService>;

  beforeEach(async () => {
    const mockService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      getDashboardStats: jest.fn(),
      addDepartment: jest.fn(),
      getDepartments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployersController],
      providers: [{ provide: EmployersService, useValue: mockService }],
    }).compile();

    controller = module.get<EmployersController>(EmployersController);
    service = module.get(EmployersService);
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
      companyName: 'Corp',
    } as any);
    const result = await controller.updateProfile('user1', {
      companyName: 'Corp',
    });
    expect(result).toEqual({ id: '1', companyName: 'Corp' });
    // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
    expect(service.updateProfile).toHaveBeenCalledWith('user1', {
      companyName: 'Corp',
    });
  });

  it('should call addDepartment', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    service.addDepartment.mockResolvedValue({
      id: '1',
      name: 'HR',
      headCount: 0,
      employerId: 'emp1',
    } as any);
    const result = await controller.addDepartment('user1', { name: 'HR' });
    expect(result).toEqual({
      id: '1',
      name: 'HR',
      headCount: 0,
      employerId: 'emp1',
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
    expect(service.addDepartment).toHaveBeenCalledWith('user1', { name: 'HR' });
  });
});
