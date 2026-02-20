import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ProductionStatus } from '@generated/prisma';
import { CreateProductionHistoryDto } from './create-production-history.dto';

export class UpdateProductionHistoryDto extends PartialType(
  CreateProductionHistoryDto,
) {
  @IsOptional()
  @IsEnum(ProductionStatus)
  status?: ProductionStatus;
}
