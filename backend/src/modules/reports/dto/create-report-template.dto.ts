import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const WIDGET_TYPES = [
  'kpi',
  'palletBar',
  'userBar',
  'timeline',
  'orderDonut',
  'detailTable',
] as const;

export class WidgetConfigDto {
  @IsIn(WIDGET_TYPES as unknown as string[])
  type: (typeof WIDGET_TYPES)[number];
}

export class CreateReportTemplateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WidgetConfigDto)
  widgets: WidgetConfigDto[];
}
