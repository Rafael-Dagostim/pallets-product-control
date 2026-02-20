import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'O token deve ser uma string' })
  @IsNotEmpty({ message: 'O token é obrigatório' })
  token: string;
}
