import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '@prisma/client-api';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status!: ApplicationStatus;

  @IsString()
  @IsOptional()
  employerNote?: string;
}
