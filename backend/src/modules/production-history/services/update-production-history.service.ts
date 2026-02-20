import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { UpdateProductionHistoryDto } from '../dto/update-production-history.dto';
import { ProductionHistoryEntity } from '../entities/production-history.entity';

@Injectable()
export class UpdateProductionHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateProductionHistoryDto,
  ): Promise<ProductionHistoryEntity> {
    const existing = await this.prisma.productionHistory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new ObjectNotFoundException('Registro de produção', 'id', id);
    }

    const record = await this.prisma.productionHistory.update({
      where: { id },
      data: dto,
      include: { user: true, pallet: true },
    });

    return new ProductionHistoryEntity(record);
  }
}
