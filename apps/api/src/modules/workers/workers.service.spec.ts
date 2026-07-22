/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { WorkersService } from './workers.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('WorkersService', () => {
  let service: WorkersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      workerProfile: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      skill: {
        upsert: jest.fn(),
      },
      workerSkill: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      providers: [WorkersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<WorkersService>(WorkersService);
  });

  describe('getProfile', () => {
    it('should throw NotFoundException if profile not found', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerProfile.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return profile', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerProfile.findUnique.mockResolvedValue({ id: 'profile-1' });
      const result = await service.getProfile('user-1');
      expect(result.id).toBe('profile-1');
    });
  });

  describe('updateProfile', () => {
    it('should upsert profile', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerProfile.upsert.mockResolvedValue({ id: 'profile-1' });
      const result = await service.updateProfile('user-1', {
        firstName: 'Test',
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(prisma.workerProfile.upsert).toHaveBeenCalled();
      expect(result.id).toBe('profile-1');
    });
  });

  describe('addSkill', () => {
    it('should throw NotFoundException if profile not found', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerProfile.findUnique.mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      await expect(service.addSkill('user-1', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if skill already exists', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerProfile.findUnique.mockResolvedValue({ id: 'profile-1' });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.skill.upsert.mockResolvedValue({ id: 'skill-1' });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerSkill.findUnique.mockResolvedValue({ id: 'ws-1' });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      await expect(service.addSkill('user-1', {} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create worker skill', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerProfile.findUnique.mockResolvedValue({ id: 'profile-1' });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.skill.upsert.mockResolvedValue({ id: 'skill-1' });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerSkill.findUnique.mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerSkill.create.mockResolvedValue({
        workerId: 'profile-1',
        skillId: 'skill-1',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      const result = await service.addSkill('user-1', {} as any);
      expect(result.skillId).toBe('skill-1');
    });
  });

  describe('removeSkill', () => {
    it('should throw NotFoundException if profile not found', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerProfile.findUnique.mockResolvedValue(null);
      await expect(service.removeSkill('user-1', 'skill-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete worker skill', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerProfile.findUnique.mockResolvedValue({ id: 'profile-1' });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.workerSkill.delete.mockResolvedValue({
        workerId: 'profile-1',
        skillId: 'skill-1',
      });

      const result = await service.removeSkill('user-1', 'skill-1');
      expect(result.skillId).toBe('skill-1');
    });
  });
});
