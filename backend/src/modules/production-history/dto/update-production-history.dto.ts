import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ProductionStatus } from '@generated/prisma';

export class UpdateProductionHistoryDto {
  @IsOptional()
  @IsEnum(ProductionStatus)
  status?: ProductionStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  reformedQuantity?: number;

  @IsOptional()
  @IsString()
  observation?: string;
}
