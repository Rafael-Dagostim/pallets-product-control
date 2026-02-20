import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductionHistoryDto {
  @IsUUID()
  palletId: string;

  @IsInt()
  @Min(1)
  deliveredQuantity: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reformedQuantity?: number;

  @IsOptional()
  @IsString()
  observation?: string;
}
