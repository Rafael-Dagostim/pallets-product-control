import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ProductionStatus, UserRole, Prisma } from '@generated/prisma';
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
  if (filters.from || filters.to) {
    const gte = filters.from ? startOfDay(filters.from) : undefined;
    const lt = filters.to ? nextDay(filters.to) : undefined;
    return { createdAt: { ...(gte && { gte }), ...(lt && { lt }) } };
  }

  const dayStart = parseDayStart(filters.date);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { createdAt: { gte: dayStart, lt: dayEnd } };
}

function parseDayStart(date?: string): Date {
  const base = date ? new Date(`${date}T00:00:00`) : new Date();
  base.setHours(0, 0, 0, 0);
  return base;
}

function startOfDay(date: string): Date {
  const d = new Date(`${date}T00:00:00`);
  d.setHours(0, 0, 0, 0);
  return d;
}

function nextDay(date: string): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 1);
  return d;
}
