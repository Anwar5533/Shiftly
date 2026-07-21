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
    service.getProfile.mockResolvedValue({ id: '1' } as any);
    const result = await controller.getProfile('user1');
    expect(result).toEqual({ id: '1' });
    expect(service.getProfile).toHaveBeenCalledWith('user1');
  });

  it('should call updateProfile', async () => {
    service.updateProfile.mockResolvedValue({
      id: '1',
      companyName: 'Corp',
    } as any);
    const result = await controller.updateProfile('user1', {
      companyName: 'Corp',
    });
    expect(result).toEqual({ id: '1', companyName: 'Corp' });
    expect(service.updateProfile).toHaveBeenCalledWith('user1', {
      companyName: 'Corp',
    });
  });

  it('should call addDepartment', async () => {
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
    expect(service.addDepartment).toHaveBeenCalledWith('user1', { name: 'HR' });
  });
});
