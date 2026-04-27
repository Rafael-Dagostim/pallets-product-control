import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ProductionStatus } from '@generated/prisma';

export class FindAllProductionHistoriesDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @IsOptional()
  @IsEnum(ProductionStatus)
  status?: ProductionStatus;
}
