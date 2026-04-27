import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@generated/prisma';
import { Roles, User } from '@shared/decorators';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { CreateReportTemplateDto } from './dto/create-report-template.dto';
import { UpdateReportTemplateDto } from './dto/update-report-template.dto';
import {
  CreateReportTemplateService,
  FindAllReportTemplatesService,
  FindOneReportTemplateService,
  GetReportSummaryService,
  RemoveReportTemplateService,
  UpdateReportTemplateService,
} from './services';

@Controller('reports')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class ReportsController {
  constructor(
    private readonly getReportSummary: GetReportSummaryService,
    private readonly createReportTemplate: CreateReportTemplateService,
    private readonly findAllReportTemplates: FindAllReportTemplatesService,
    private readonly findOneReportTemplate: FindOneReportTemplateService,
    private readonly updateReportTemplate: UpdateReportTemplateService,
    private readonly removeReportTemplate: RemoveReportTemplateService,
  ) {}

  @Get('summary')
  summary(@Query() filters: ReportFiltersDto) {
    return this.getReportSummary.execute(filters);
  }

  @Get('templates')
  listTemplates() {
    return this.findAllReportTemplates.execute();
  }

  @Post('templates')
  createTemplate(
    @Body() dto: CreateReportTemplateDto,
    @User('userId') userId: string,
  ) {
    return this.createReportTemplate.execute(dto, userId);
  }

  @Get('templates/:id')
  findTemplate(@Param('id') id: string) {
    return this.findOneReportTemplate.execute(id);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateReportTemplateDto,
  ) {
    return this.updateReportTemplate.execute(id, dto);
  }

  @Delete('templates/:id')
  removeTemplate(@Param('id') id: string) {
    return this.removeReportTemplate.execute(id);
  }
}
