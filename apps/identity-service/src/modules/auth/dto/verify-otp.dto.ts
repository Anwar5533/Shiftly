import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { verifyOtpSchema } from '@shiftly/shared-validation';
import { createZodDto } from '../../../shared/utils/zod-dto.util';

export class VerifyOtpDto extends createZodDto(verifyOtpSchema) {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  declare phone: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsString()
  declare otp: string;
}
