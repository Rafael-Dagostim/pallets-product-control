import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateProductionHistoryDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  palletId: string;

  @IsInt()
  @Min(1)
  deliveredQuantity: number;
}
