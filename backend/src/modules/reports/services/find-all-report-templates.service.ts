import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ReportTemplateEntity } from '../entities/report-template.entity';

@Injectable()
export class FindAllReportTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<ReportTemplateEntity[]> {
    const records = await this.prisma.reportTemplate.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    return records.map((r) => new ReportTemplateEntity(r));
  }
}
