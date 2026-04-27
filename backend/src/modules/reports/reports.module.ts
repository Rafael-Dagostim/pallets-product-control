import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import {
  CreateReportTemplateService,
  FindAllReportTemplatesService,
  FindOneReportTemplateService,
  GetReportSummaryService,
  RemoveReportTemplateService,
  UpdateReportTemplateService,
} from './services';

@Module({
  controllers: [ReportsController],
  providers: [
    GetReportSummaryService,
    CreateReportTemplateService,
    FindAllReportTemplatesService,
    FindOneReportTemplateService,
    UpdateReportTemplateService,
    RemoveReportTemplateService,
  ],
})
export class ReportsModule {}
