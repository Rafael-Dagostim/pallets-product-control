import { Injectable } from '@nestjs/common';
import { UserRole } from '@generated/prisma';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { ProductionHistoryEntity } from '../entities/production-history.entity';

@Injectable()
export class FindOneProductionHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    actorId: string,
    actorRole: UserRole,
  ): Promise<ProductionHistoryEntity> {
    const record = await this.prisma.productionHistory.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: true,
        pallet: { select: { id: true, name: true, version: true } },
      },
    });

    // EMPLOYEE may only read their own records. Throw the same not-found
    // exception so the endpoint never reveals that another user's record exists.
    if (
      !record ||
      (actorRole === UserRole.EMPLOYEE && record.userId !== actorId)
    ) {
      throw new ObjectNotFoundException('Registro de produção', 'id', id);
    }

    return new ProductionHistoryEntity(record);
  }
}
