import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ProductionStatus } from '@generated/prisma';
import { ProductionHistoryEntity } from '../entities/production-history.entity';

@Injectable()
export class BulkPayProductionHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(ids: string[]): Promise<ProductionHistoryEntity[]> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.productionHistory.findMany({
        where: { id: { in: ids }, deletedAt: null },
        select: { id: true, status: true },
      });

      const foundIds = new Set(existing.map((r) => r.id));
      const missing = ids.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        throw new BadRequestException(
          `Registros não encontrados: ${missing.join(', ')}`,
        );
      }

      const notVerified = existing.filter(
        (r) => r.status !== ProductionStatus.VERIFIED,
      );
      if (notVerified.length > 0) {
        throw new BadRequestException(
          `Apenas registros verificados podem ser pagos. IDs inválidos: ${notVerified
            .map((r) => r.id)
            .join(', ')}`,
        );
      }

      await tx.productionHistory.updateMany({
        where: { id: { in: ids } },
        data: { status: ProductionStatus.PAID },
      });

      const updated = await tx.productionHistory.findMany({
        where: { id: { in: ids } },
        include: { user: true, pallet: true },
        orderBy: { createdAt: 'desc' },
      });

      return updated.map((record) => new ProductionHistoryEntity(record));
    });
  }
}
