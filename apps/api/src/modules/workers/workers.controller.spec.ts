/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      providers: [{ provide: WorkersService, useValue: workersService }],
    }).compile();

    controller = module.get<WorkersController>(WorkersController);
  });

  describe('getProfile', () => {
    it('should call getProfile', async () => {
      await controller.getProfile('user-1');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(workersService.getProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateProfile', () => {
    it('should call updateProfile', async () => {
      await controller.updateProfile('user-1', { firstName: 'Test' });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(workersService.updateProfile).toHaveBeenCalledWith('user-1', {
        firstName: 'Test',
      });
    });
  });

  describe('addSkill', () => {
    it('should call addSkill', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      await controller.addSkill('user-1', { skillName: 'React' } as any);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(workersService.addSkill).toHaveBeenCalledWith('user-1', {
        skillName: 'React',
      });
    });
  });

  describe('removeSkill', () => {
    it('should call removeSkill', async () => {
      await controller.removeSkill('user-1', 'skill-1');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(workersService.removeSkill).toHaveBeenCalledWith(
        'user-1',
        'skill-1',
      );
    });
  });

  describe('getPublicProfile', () => {
    it('should call getProfile', async () => {
      await controller.getPublicProfile('user-2');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(workersService.getProfile).toHaveBeenCalledWith('user-2');
    });
  });
});
