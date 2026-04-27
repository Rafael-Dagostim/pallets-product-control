import { IsInt, IsString, Length, Min } from 'class-validator';

export class CreateProductionHistoryDto {
  @IsString()
  @Length(26, 26)
  userId: string;

  @IsString()
  @Length(26, 26)
  palletId: string;

  @IsInt()
  @Min(1)
  deliveredQuantity: number;
}
