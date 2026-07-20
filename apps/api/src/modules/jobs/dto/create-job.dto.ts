import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { JobType, SalaryPeriod } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(JobType)
  jobType!: JobType;

  @IsObject()
  location!: Record<string, any>; // Represents a JobLocation JSON object

  @IsBoolean()
  @IsOptional()
  isRemote?: boolean;

  @IsNumber()
  @Type(() => Number)
  salaryMin!: number;

  @IsNumber()
  @Type(() => Number)
  salaryMax!: number;

  @IsString()
  @IsOptional()
  salaryCurrency?: string;

  @IsEnum(SalaryPeriod)
  @IsOptional()
  salaryPeriod?: SalaryPeriod;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  shiftDurationHours?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  positionsTotal?: number;

  @IsDateString()
  @IsOptional()
  applicationDeadline?: string;
}
