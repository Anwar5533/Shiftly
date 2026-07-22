/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { AddDepartmentDto } from './dto/add-department.dto';

@Injectable()
export class EmployersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.employerProfile.findUnique({
      where: { userId },
      include: {
        departments: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Employer profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateDto: UpdateEmployerProfileDto) {
    return this.prisma.employerProfile.upsert({
      where: { userId },
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      update: updateDto as any,
      create: {
        userId,
        companyName: updateDto.companyName || 'My Company',
        industry: updateDto.industry || 'Other',
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        location: updateDto.location ? (updateDto.location as any) : {},
      },
      include: {
        departments: true,
      },
    });
  }

  async addDepartment(userId: string, departmentDto: AddDepartmentDto) {
    const profile = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Employer profile not found');
    }

    const existingDepartment = await this.prisma.department.findFirst({
      where: {
        employerId: profile.id,
        name: departmentDto.name,
      },
    });

    if (existingDepartment) {
      throw new ConflictException('Department already exists');
    }

    return this.prisma.department.create({
      data: {
        employerId: profile.id,
        name: departmentDto.name,
        headCount: 0,
      },
    });
  }

  async getDepartments(userId: string) {
    const profile = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Employer profile not found');
    }

    return this.prisma.department.findMany({
      where: { employerId: profile.id },
    });
  }

  async getDashboardStats(userId: string) {
    const profile = await this.prisma.employerProfile.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            jobs: true,
            departments: true,
          },
        },
        jobs: {
          select: {
            _count: {
              select: {
                applications: true,
                shifts: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Employer profile not found');
    }

    const activeJobsCount = profile._count.jobs;
    let totalApplications = 0;
    let totalShifts = 0;

    for (const job of profile.jobs) {
      totalApplications += job._count.applications;
      totalShifts += job._count.shifts;
    }

    const completion = this.calculateProfileCompletion(profile);

    return {
      activeJobs: activeJobsCount,
      totalApplications,
      totalShifts,
      totalDepartments: profile._count.departments,
      profileCompletion: completion,
      rating: profile.rating,
      totalSpent: 0, // Placeholder
    };
  }

  private calculateProfileCompletion(profile: any): number {
    let score = 0;
    const totalFields = 4;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.companyName) score += 1;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.industry) score += 1;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.logoUrl) score += 1;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.website) score += 1;

    return Math.round((score / totalFields) * 100);
  }
}
