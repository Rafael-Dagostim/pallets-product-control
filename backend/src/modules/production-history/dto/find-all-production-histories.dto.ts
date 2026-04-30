import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ProductionStatus } from '@generated/prisma';

export class FindAllProductionHistoriesDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  @Length(26, 26)
  userId?: string;

  @IsOptional()
  @IsEnum(ProductionStatus)
  status?: ProductionStatus;
}
