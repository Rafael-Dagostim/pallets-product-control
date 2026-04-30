import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { UserRole, Prisma } from '@generated/prisma';
import { ProductionHistoryEntity } from '../entities/production-history.entity';
import { FindAllProductionHistoriesDto } from '../dto/find-all-production-histories.dto';

@Injectable()
export class FindAllProductionHistoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    actorId: string,
    actorRole: UserRole,
    filters: FindAllProductionHistoriesDto = {},
  ): Promise<ProductionHistoryEntity[]> {
    const where: Prisma.ProductionHistoryWhereInput = {
      deletedAt: null,
      ...buildDateFilter(filters),
      ...(filters.status ? { status: filters.status } : {}),
      ...(actorRole === UserRole.EMPLOYEE
        ? { userId: actorId }
        : filters.userId
          ? { userId: filters.userId }
          : {}),
    };

    const records = await this.prisma.productionHistory.findMany({
      where,
      include: { user: true, pallet: true },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => new ProductionHistoryEntity(record));
  }
}

function buildDateFilter(
  filters: FindAllProductionHistoriesDto,
): Prisma.ProductionHistoryWhereInput {
  if (!filters.from && !filters.to) return {};
  return {
    createdAt: {
      ...(filters.from && { gte: new Date(filters.from) }),
      ...(filters.to && { lte: new Date(filters.to) }),
    },
  };
}
