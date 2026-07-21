import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WorkersService } from './workers.service';
import { UpdateWorkerProfileDto } from './dto/update-worker-profile.dto';
import { AddWorkerSkillDto } from './dto/add-worker-skill.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../shared/decorators/public.decorator';

@Controller({ path: 'workers', version: '1' })
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  getProfile(@CurrentUser('sub') userId: string) {
    return this.workersService.getProfile(userId);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  getDashboardStats(@CurrentUser('sub') userId: string) {
    return this.workersService.getDashboardStats(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateDto: UpdateWorkerProfileDto,
  ) {
    return this.workersService.updateProfile(userId, updateDto);
  }

  @Post('skills')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  addSkill(
    @CurrentUser('sub') userId: string,
    @Body() skillDto: AddWorkerSkillDto,
  ) {
    return this.workersService.addSkill(userId, skillDto);
  }

  @Delete('skills/:skillId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  removeSkill(
    @CurrentUser('sub') userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.workersService.removeSkill(userId, skillId);
  }

  @Get(':userId/profile')
  @Public()
  getPublicProfile(@Param('userId') userId: string) {
    return this.workersService.getProfile(userId);
  }
}
