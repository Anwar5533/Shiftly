import { IsString, IsOptional, IsArray, IsUrl } from 'class-validator';

export class UpdateRecruiterProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  agencyName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialisations?: string[];
}
