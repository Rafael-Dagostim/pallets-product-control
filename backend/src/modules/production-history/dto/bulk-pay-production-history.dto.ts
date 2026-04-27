import { ArrayMinSize, IsArray, IsString, Length } from 'class-validator';

export class BulkPayProductionHistoryDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Length(26, 26, { each: true })
  ids: string[];
}
