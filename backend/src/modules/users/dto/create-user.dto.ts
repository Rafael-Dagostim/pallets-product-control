import { IsEnum, IsString, MaxLength } from 'class-validator';
import { UserRole } from '@generated/prisma';

export class CreateUserDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(20)
  document: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
