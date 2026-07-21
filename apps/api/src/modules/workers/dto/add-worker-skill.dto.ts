import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddWorkerSkillDto {
  @IsString()
  @IsNotEmpty()
  skillName!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(50)
  yearsExp!: number;

  @IsString()
  @IsIn(['BEGINNER', 'INTERMEDIATE', 'EXPERT'])
  proficiency!: string;
}
