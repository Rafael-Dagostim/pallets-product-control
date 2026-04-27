import { IsInt, IsString, Length, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  @Length(26, 26)
  orderId: string;

  @IsString()
  @Length(26, 26)
  palletId: string;

  @IsInt()
  @Min(1)
  quantityRequested: number;
}
