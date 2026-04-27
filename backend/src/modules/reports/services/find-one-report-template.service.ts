import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { ReportTemplateEntity } from '../entities/report-template.entity';

@Injectable()
export class FindOneReportTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<ReportTemplateEntity> {
    const record = await this.prisma.reportTemplate.findFirst({
      where: { id, deletedAt: null },
    });

    if (!record) {
      throw new ObjectNotFoundException('Template de relatório', 'id', id);
    }

    return new ReportTemplateEntity(record);
  }
}
