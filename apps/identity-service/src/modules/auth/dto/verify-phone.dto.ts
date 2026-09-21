import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPhoneDto {
  @ApiProperty({ description: 'The phone number to verify', example: '+1234567890' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone!: string;

  @ApiProperty({ description: 'The OTP code received', example: '123456' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp!: string;
}
