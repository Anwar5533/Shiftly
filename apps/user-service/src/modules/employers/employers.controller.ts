import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { EmployersService } from './employers.service';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { AddDepartmentDto } from './dto/add-department.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';

@Controller({ path: 'employers', version: '1' })
export class EmployersController {
  constructor(private readonly employersService: EmployersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'WORKER')
  getProfile(@CurrentUser('sub') userId: string) {
    return this.employersService.getProfile(userId);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'WORKER')
  getDashboardStats(@CurrentUser('sub') userId: string) {
    return this.employersService.getDashboardStats(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'WORKER')
  updateProfile(@CurrentUser('sub') userId: string, @Body() updateDto: UpdateEmployerProfileDto) {
    return this.employersService.updateProfile(userId, updateDto);
  }

  @Get('departments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'WORKER')
  getDepartments(@CurrentUser('sub') userId: string) {
    return this.employersService.getDepartments(userId);
  }

  @Post('departments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'WORKER')
  addDepartment(@CurrentUser('sub') userId: string, @Body() departmentDto: AddDepartmentDto) {
    return this.employersService.addDepartment(userId, departmentDto);
  }

  @Get(':userId/profile')
  @Public()
  getPublicProfile(@Param('userId') userId: string) {
    return this.employersService.getProfile(userId);
  }
}
