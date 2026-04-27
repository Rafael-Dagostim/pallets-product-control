import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemNestedDto } from './create-order-item-nested.dto';

export class CreateOrderDto {
  @IsString()
  @Length(26, 26)
  customerId: string;

  @IsDateString()
  deadline: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemNestedDto)
  items: CreateOrderItemNestedDto[];
}
