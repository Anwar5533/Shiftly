import { Test, TestingModule } from '@nestjs/testing';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';

describe('WorkersController', () => {
  let controller: WorkersController;
  let workersService: any;

  beforeEach(async () => {
    workersService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      addSkill: jest.fn(),
      removeSkill: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkersController],
      providers: [{ provide: WorkersService, useValue: workersService }],
    }).compile();

    controller = module.get<WorkersController>(WorkersController);
  });

  describe('getProfile', () => {
    it('should call getProfile', async () => {
      await controller.getProfile('user-1');
      expect(workersService.getProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateProfile', () => {
    it('should call updateProfile', async () => {
      await controller.updateProfile('user-1', { firstName: 'Test' });
      expect(workersService.updateProfile).toHaveBeenCalledWith('user-1', {
        firstName: 'Test',
      });
    });
  });

  describe('addSkill', () => {
    it('should call addSkill', async () => {
      await controller.addSkill('user-1', { skillName: 'React' } as any);
      expect(workersService.addSkill).toHaveBeenCalledWith('user-1', {
        skillName: 'React',
      });
    });
  });

  describe('removeSkill', () => {
    it('should call removeSkill', async () => {
      await controller.removeSkill('user-1', 'skill-1');
      expect(workersService.removeSkill).toHaveBeenCalledWith(
        'user-1',
        'skill-1',
      );
    });
  });

  describe('getPublicProfile', () => {
    it('should call getProfile', async () => {
      await controller.getPublicProfile('user-2');
      expect(workersService.getProfile).toHaveBeenCalledWith('user-2');
    });
  });
});
