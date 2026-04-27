import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ReportFiltersDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @IsOptional()
  @IsUUID('4')
  palletId?: string;
}
