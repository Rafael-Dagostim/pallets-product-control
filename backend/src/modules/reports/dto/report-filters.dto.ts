import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class ReportFiltersDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  @IsString()
  @Length(26, 26)
  userId?: string;

  @IsOptional()
  @IsString()
  @Length(26, 26)
  palletId?: string;
}
