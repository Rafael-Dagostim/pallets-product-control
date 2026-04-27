import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { Prisma } from '@generated/prisma';
import { CreateReportTemplateDto } from '../dto/create-report-template.dto';
import { ReportTemplateEntity } from '../entities/report-template.entity';

@Injectable()
export class CreateReportTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: CreateReportTemplateDto,
    createdById: string,
  ): Promise<ReportTemplateEntity> {
    const existing = await this.prisma.reportTemplate.findFirst({
      where: { name: dto.name, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('Já existe um template com este nome.');
    }

    const record = await this.prisma.reportTemplate.create({
      data: {
        name: dto.name,
        widgets: dto.widgets as unknown as Prisma.InputJsonValue,
        createdById,
      },
    });

    return new ReportTemplateEntity(record);
  }
}
