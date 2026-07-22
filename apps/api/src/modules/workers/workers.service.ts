import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { UpdateWorkerProfileDto } from './dto/update-worker-profile.dto';
import { AddWorkerSkillDto } from './dto/add-worker-skill.dto';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        certifications: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateDto: UpdateWorkerProfileDto) {
    return this.prisma.workerProfile.upsert({
      where: { userId },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      update: updateDto as any,
      create: {
        userId,
        firstName: updateDto.firstName || 'Worker',
        lastName: updateDto.lastName || 'Profile',
        bio: updateDto.bio || null,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        location: updateDto.location ? (updateDto.location as any) : {},
        // Defaults handles the rest
      },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });
  }

  async addSkill(userId: string, skillDto: AddWorkerSkillDto) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    // Upsert skill in the global skills table
    const skill = await this.prisma.skill.upsert({
      where: { name: skillDto.skillName },
      update: {},
      create: {
        name: skillDto.skillName,
        category: skillDto.category,
      },
    });

    // Check if worker already has this skill
    const existingSkill = await this.prisma.workerSkill.findUnique({
      where: {
        workerId_skillId: {
          workerId: profile.id,
          skillId: skill.id,
        },
      },
    });

    if (existingSkill) {
      throw new ConflictException('Worker already has this skill');
    }

    // Link skill to worker
    return this.prisma.workerSkill.create({
      data: {
        workerId: profile.id,
        skillId: skill.id,
        yearsExp: skillDto.yearsExp,
        proficiency: skillDto.proficiency,
      },
      include: {
        skill: true,
      },
    });
  }

  async removeSkill(userId: string, skillId: string) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    return this.prisma.workerSkill.delete({
      where: {
        workerId_skillId: {
          workerId: profile.id,
          skillId: skillId,
        },
      },
    });
  }

  async getDashboardStats(userId: string) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            applications: true,
            shifts: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    const completion = this.calculateProfileCompletion(profile);

    return {
      totalEarnings: 0, // Placeholder until payments module is linked
      activeApplications: profile._count.applications,
      completedShifts: profile._count.shifts,
      profileCompletion: completion,
      rating: profile.rating,
    };
  }

  private calculateProfileCompletion(profile: any): number {
    let score = 0;
    const totalFields = 5;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.firstName && profile.lastName) score += 1;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.bio) score += 1;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.avatarUrl) score += 1;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.experienceYears > 0) score += 1;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    if (profile.hourlyRate) score += 1;

    return Math.round((score / totalFields) * 100);
  }
}
