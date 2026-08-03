import { IsString, IsNotEmpty } from 'class-validator';

export class AddDepartmentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
