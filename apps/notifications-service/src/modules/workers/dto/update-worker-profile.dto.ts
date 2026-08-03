import { IsString, IsOptional, IsNumber, IsObject, IsEnum, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AvailabilityType } from '@prisma/client';

export class UpdateWorkerProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsObject()
  location?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(50)
  experienceYears?: number;

  @IsOptional()
  @IsEnum(AvailabilityType)
  availability?: AvailabilityType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;
}
