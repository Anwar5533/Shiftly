import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '@prisma/client-applications-service';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status!: ApplicationStatus;

  @IsString()
  @IsOptional()
  employerNote?: string;
}
