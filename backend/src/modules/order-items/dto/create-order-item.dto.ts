import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  palletId: string;

  @IsInt()
  @Min(1)
  quantityRequested: number;
}
