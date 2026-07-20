import { IsNumber, Min, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class TopupWalletDto {
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;
}
