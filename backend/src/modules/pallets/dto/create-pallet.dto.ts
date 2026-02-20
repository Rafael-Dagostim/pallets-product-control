import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePalletDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsNumber()
  buyCost: number;

  @IsNumber()
  productionCost: number;

  @IsNumber()
  sellPrice: number;

  @IsOptional()
  @IsUUID()
  versionFromId?: string;
}
