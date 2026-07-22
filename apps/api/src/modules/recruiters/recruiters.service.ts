/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { UpdateRecruiterProfileDto } from './dto/update-recruiter-profile.dto';

@Injectable()
export class RecruitersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Recruiter profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateDto: UpdateRecruiterProfileDto) {
    return this.prisma.recruiterProfile.upsert({
      where: { userId },
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      update: updateDto as any,
      create: {
        userId,
        firstName: updateDto.firstName || 'New',
        lastName: updateDto.lastName || 'Recruiter',
        agencyName: updateDto.agencyName,
        bio: updateDto.bio,
        specialisations: updateDto.specialisations || [],
      },
    });
  }

  async getDashboardStats(userId: string) {
    const profile = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            jobs: true,
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
      throw new NotFoundException('Recruiter profile not found');
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
      placements: profile.placements,
      successRate: profile.successRate,
      profileCompletion: completion,
      rating: profile.rating,
    };
  }

  private calculateProfileCompletion(profile: any): number {
    let score = 0;
    const totalFields = 4;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.firstName) score += 1;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.agencyName) score += 1;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.bio) score += 1;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.specialisations && profile.specialisations.length > 0)
      score += 1;

    return Math.round((score / totalFields) * 100);
  }
}
