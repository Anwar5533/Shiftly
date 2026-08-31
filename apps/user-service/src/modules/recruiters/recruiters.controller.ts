import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RecruitersService } from './recruiters.service';
import { UpdateRecruiterProfileDto } from './dto/update-recruiter-profile.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';

@Controller({ path: 'recruiters', version: '1' })
export class RecruitersController {
  constructor(private readonly recruitersService: RecruitersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECRUITER')
  getProfile(@CurrentUser('sub') userId: string) {
    return this.recruitersService.getProfile(userId);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECRUITER')
  getDashboardStats(@CurrentUser('sub') userId: string) {
    return this.recruitersService.getDashboardStats(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECRUITER')
  updateProfile(@CurrentUser('sub') userId: string, @Body() updateDto: UpdateRecruiterProfileDto) {
    return this.recruitersService.updateProfile(userId, updateDto);
  }

  @Get(':userId/profile')
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  getPublicProfile(@Param('userId') userId: string) {
    return this.recruitersService.getProfile(userId);
  }
}
