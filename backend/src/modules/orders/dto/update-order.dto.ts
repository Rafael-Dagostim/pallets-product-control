import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { OrderStatus } from '@generated/prisma';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @Length(26, 26)
  customerId?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
