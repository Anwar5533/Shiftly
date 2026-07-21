import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterEmailDto {
  @ApiProperty({ example: 'hr@acmecorp.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'SecurePass@123',
    description: 'Min 8 chars, uppercase, number, symbol',
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName!: string;

  @ApiProperty({ enum: ['EMPLOYER', 'RECRUITER'] })
  @IsString()
  role!: 'EMPLOYER' | 'RECRUITER';
}
