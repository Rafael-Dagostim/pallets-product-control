import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateOrderItemNestedDto {
  @IsUUID()
  palletId: string;

  @IsInt()
  @Min(1)
  quantityRequested: number;
}
