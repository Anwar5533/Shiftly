import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginEmailDto {
  @ApiProperty({ example: 'hr@acmecorp.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass@123' })
  @IsString()
  password!: string;
}
