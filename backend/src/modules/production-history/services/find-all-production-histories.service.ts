import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ProductionHistoryEntity } from '../entities/production-history.entity';

@Injectable()
export class FindAllProductionHistoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<ProductionHistoryEntity[]> {
    const records = await this.prisma.productionHistory.findMany({
      where: { deletedAt: null },
      include: { user: true, pallet: true },
    });

    return records.map((record) => new ProductionHistoryEntity(record));
  }
}
