import { Controller, Post, Get, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@Controller({ path: 'applications', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles('WORKER', 'EMPLOYER')
  applyToJob(@CurrentUser('sub') userId: string, @Body() createDto: CreateApplicationDto) {
    return this.applicationsService.applyToJob(userId, createDto);
  }

  @Get('my-applications')
  @Roles('WORKER', 'EMPLOYER')
  getMyApplications(@CurrentUser('sub') userId: string, @Query() query: PaginationDto) {
    return this.applicationsService.getMyApplications(userId, query.page, query.limit);
  }

  @Get('check/:jobId')
  @Roles('WORKER', 'EMPLOYER')
  checkApplicationStatus(@CurrentUser('sub') userId: string, @Param('jobId') jobId: string) {
    return this.applicationsService.checkApplicationStatus(userId, jobId);
  }

  @Get('recent')
  @Roles('EMPLOYER', 'WORKER')
  getRecentApplications(@CurrentUser('sub') userId: string) {
    return this.applicationsService.getRecentApplications(userId);
  }

  @Get('job/:jobId')
  @Roles('EMPLOYER', 'WORKER')
  getApplicationsForJob(
    @CurrentUser('sub') userId: string,
    @Param('jobId') jobId: string,
    @Query() query: PaginationDto,
  ) {
    return this.applicationsService.getApplicationsForJob(userId, jobId, query.page, query.limit);
  }

  @Patch(':id/status')
  @Roles('EMPLOYER', 'WORKER')
  updateApplicationStatus(
    @CurrentUser('sub') userId: string,
    @Param('id') applicationId: string,
    @Body() updateDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateApplicationStatus(userId, applicationId, updateDto);
  }

  @Patch(':id/withdraw')
  @Roles('WORKER', 'EMPLOYER')
  withdrawApplication(@CurrentUser('sub') userId: string, @Param('id') applicationId: string) {
    return this.applicationsService.withdrawApplication(userId, applicationId);
  }
}
