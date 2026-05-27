import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'O login deve ser uma string' })
  @IsNotEmpty({ message: 'O login é obrigatório' })
  @MaxLength(20)
  login: string;

  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}
