import { PartialType } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { JobStatus } from '@prisma/client-api';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;
}
