import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

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
  @IsString()
  @Length(26, 26)
  versionFromId?: string;
}
