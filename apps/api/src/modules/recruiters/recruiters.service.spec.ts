/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { RecruitersService } from './recruiters.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RecruitersService', () => {
  let service: RecruitersService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      recruiterProfile: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruitersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RecruitersService>(RecruitersService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return profile if found', async () => {
      const mockProfile = { id: '1', userId: 'user1' };
      (
        prismaService.recruiterProfile.findUnique as jest.Mock
      ).mockResolvedValue(mockProfile);

      const result = await service.getProfile('user1');
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      (
        prismaService.recruiterProfile.findUnique as jest.Mock
      ).mockResolvedValue(null);
      await expect(service.getProfile('user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should upsert profile', async () => {
      const mockProfile = { id: '1', userId: 'user1', firstName: 'Jane' };
      (prismaService.recruiterProfile.upsert as jest.Mock).mockResolvedValue(
        mockProfile,
      );

      const result = await service.updateProfile('user1', {
        firstName: 'Jane',
      });
      expect(result).toEqual(mockProfile);
// eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
      expect(prismaService.recruiterProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1' },
        }),
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should calculate dashboard stats', async () => {
      const mockProfile = {
        id: '1',
        userId: 'user1',
        placements: 10,
        successRate: 95.5,
        rating: 4.8,
        firstName: 'Jane',
        _count: { jobs: 5 },
        jobs: [
          { _count: { applications: 3, shifts: 1 } },
          { _count: { applications: 2, shifts: 4 } },
        ],
      };
      (
        prismaService.recruiterProfile.findUnique as jest.Mock
      ).mockResolvedValue(mockProfile);

      const result = await service.getDashboardStats('user1');
      expect(result).toEqual(
        expect.objectContaining({
          activeJobs: 5,
          totalApplications: 5,
          totalShifts: 5,
          placements: 10,
        }),
      );
    });
  });
});
