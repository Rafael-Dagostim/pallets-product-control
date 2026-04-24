import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { UserRole } from '@generated/prisma';
import { ProductionHistoryEntity } from '../entities/production-history.entity';

@Injectable()
export class FindAllProductionHistoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: string,
    role: UserRole,
    date?: string,
  ): Promise<ProductionHistoryEntity[]> {
    const dayStart = parseDayStart(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const records = await this.prisma.productionHistory.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: dayStart, lt: dayEnd },
        ...(role === UserRole.EMPLOYEE ? { userId } : {}),
      },
      include: { user: true, pallet: true },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => new ProductionHistoryEntity(record));
  }
}

function parseDayStart(date?: string): Date {
  const base = date ? new Date(`${date}T00:00:00`) : new Date();
  base.setHours(0, 0, 0, 0);
  return base;
}
