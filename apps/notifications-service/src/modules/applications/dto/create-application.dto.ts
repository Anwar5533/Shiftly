import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  jobId!: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;
}
