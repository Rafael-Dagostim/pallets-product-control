import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '@generated/prisma';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  login: string;

  // Min 6; capped at 64 because bcrypt only hashes the first 72 bytes and the
  // password is concatenated with a server-side pepper before hashing.
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'A senha deve ter ao menos 6 caracteres' })
  @MaxLength(64)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
