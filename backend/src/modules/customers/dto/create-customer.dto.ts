import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
