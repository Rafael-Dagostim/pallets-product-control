import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { ProductionHistoryEntity } from '../entities/production-history.entity';

@Injectable()
export class FindOneProductionHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<ProductionHistoryEntity> {
    const record = await this.prisma.productionHistory.findFirst({
      where: { id, deletedAt: null },
      include: { user: true, pallet: true },
    });

    if (!record) {
      throw new ObjectNotFoundException('Registro de produção', 'id', id);
    }

    return new ProductionHistoryEntity(record);
  }
}
