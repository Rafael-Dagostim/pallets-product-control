import { IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  corporateName?: string;
}
