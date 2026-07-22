/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { EmployersService } from './employers.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('EmployersService', () => {
  let service: EmployersService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      employerProfile: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      department: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EmployersService>(EmployersService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return profile if found', async () => {
      const mockProfile = { id: '1', userId: 'user1' };
      (prismaService.employerProfile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile,
      );

      const result = await service.getProfile('user1');
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      (prismaService.employerProfile.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(service.getProfile('user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should upsert profile', async () => {
      const mockProfile = { id: '1', userId: 'user1', companyName: 'New Corp' };
      (prismaService.employerProfile.upsert as jest.Mock).mockResolvedValue(
        mockProfile,
      );

      const result = await service.updateProfile('user1', {
        companyName: 'New Corp',
      });
      expect(result).toEqual(mockProfile);
// eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
      expect(prismaService.employerProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1' },
        }),
      );
    });
  });

  describe('addDepartment', () => {
    it('should throw NotFoundException if employer profile does not exist', async () => {
      (prismaService.employerProfile.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(
        service.addDepartment('user1', { name: 'HR' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if department already exists', async () => {
      (prismaService.employerProfile.findUnique as jest.Mock).mockResolvedValue(
        { id: 'emp1' },
      );
      (prismaService.department.findFirst as jest.Mock).mockResolvedValue({
        id: 'dep1',
      });

      await expect(
        service.addDepartment('user1', { name: 'HR' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create department', async () => {
      (prismaService.employerProfile.findUnique as jest.Mock).mockResolvedValue(
        { id: 'emp1' },
      );
      (prismaService.department.findFirst as jest.Mock).mockResolvedValue(null);

      const newDep = { id: 'dep2', name: 'HR', employerId: 'emp1' };
      (prismaService.department.create as jest.Mock).mockResolvedValue(newDep);

      const result = await service.addDepartment('user1', { name: 'HR' });
      expect(result).toEqual(newDep);
// eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
      expect(prismaService.department.create).toHaveBeenCalledWith(
        expect.objectContaining({
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
          data: expect.objectContaining({ name: 'HR', employerId: 'emp1' }),
        }),
      );
    });
  });
});
