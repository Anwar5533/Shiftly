import { IsNumber, Min, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEscrowDto {
  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  amount!: number;
}
