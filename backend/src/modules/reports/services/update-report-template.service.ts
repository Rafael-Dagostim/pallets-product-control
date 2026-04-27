import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { Prisma } from '@generated/prisma';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { UpdateReportTemplateDto } from '../dto/update-report-template.dto';
import { ReportTemplateEntity } from '../entities/report-template.entity';

@Injectable()
export class UpdateReportTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateReportTemplateDto,
  ): Promise<ReportTemplateEntity> {
    const existing = await this.prisma.reportTemplate.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new ObjectNotFoundException('Template de relatório', 'id', id);
    }

    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.prisma.reportTemplate.findFirst({
        where: { name: dto.name, deletedAt: null, id: { not: id } },
      });
      if (conflict) {
        throw new ConflictException('Já existe um template com este nome.');
      }
    }

    const record = await this.prisma.reportTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.widgets !== undefined
          ? { widgets: dto.widgets as unknown as Prisma.InputJsonValue }
          : {}),
      },
    });

    return new ReportTemplateEntity(record);
  }
}
