import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
      update: updateDto as any,
      create: {
        userId,
        firstName: updateDto.firstName || 'Worker',
        lastName: updateDto.lastName || 'Profile',
        bio: updateDto.bio || null,
        location: updateDto.location ? (updateDto.location as any) : {},
        // Defaults handles the rest
      },
      include: {
        skills: {
          include: { skill: true }
        }
      }
    });
  }

  async addSkill(userId: string, skillDto: AddWorkerSkillDto) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
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
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
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
}
