import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { sendOtpSchema } from '@shiftly/shared-validation';
import { createZodDto } from '../../../shared/utils/zod-dto.util';

export class SendOtpDto extends createZodDto(sendOtpSchema) {
  @ApiProperty({ example: '+919876543210', description: 'Phone number in E.164 format' })
  @IsString()
  declare phone: string;
}
