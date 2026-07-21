import { IsString, IsOptional, IsObject, IsEnum, IsUrl } from 'class-validator';
import { EmployeeCountRange } from '@prisma/client';

export class UpdateEmployerProfileDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  location?: Record<string, any>;

  @IsOptional()
  @IsEnum(EmployeeCountRange)
  employeeCount?: EmployeeCountRange;
}
