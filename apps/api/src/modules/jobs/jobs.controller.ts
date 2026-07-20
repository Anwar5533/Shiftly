import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../shared/decorators/public.decorator';

@Controller({ path: 'jobs', version: '1' })
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.RECRUITER)
  createJob(@CurrentUser('sub') userId: string, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.createJob(userId, createJobDto);
  }

  @Get('search')
  @Public() // Search is public, but we might want to track analytics if logged in
  searchJobs(@Query() searchDto: SearchJobsDto) {
    return this.jobsService.searchJobs(searchDto);
  }

  @Get(':id')
  @Public()
  getJobById(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.RECRUITER)
  closeJob(@CurrentUser('sub') userId: string, @Param('id') jobId: string) {
    return this.jobsService.closeJob(userId, jobId);
  }
}
