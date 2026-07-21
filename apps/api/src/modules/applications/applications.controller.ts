import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller({ path: 'applications', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(UserRole.WORKER)
  applyToJob(
    @CurrentUser('sub') userId: string,
    @Body() createDto: CreateApplicationDto,
  ) {
    return this.applicationsService.applyToJob(userId, createDto);
  }

  @Get('my-applications')
  @Roles(UserRole.WORKER)
  getMyApplications(@CurrentUser('sub') userId: string) {
    return this.applicationsService.getMyApplications(userId);
  }

  @Get('recent')
  @Roles(UserRole.EMPLOYER)
  getRecentApplications(@CurrentUser('sub') userId: string) {
    return this.applicationsService.getRecentApplications(userId);
  }

  @Get('job/:jobId')
  @Roles(UserRole.EMPLOYER)
  getApplicationsForJob(
    @CurrentUser('sub') userId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.applicationsService.getApplicationsForJob(userId, jobId);
  }

  @Patch(':id/status')
  @Roles(UserRole.EMPLOYER)
  updateApplicationStatus(
    @CurrentUser('sub') userId: string,
    @Param('id') applicationId: string,
    @Body() updateDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateApplicationStatus(userId, applicationId, updateDto);
  }
}
