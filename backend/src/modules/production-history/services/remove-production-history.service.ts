import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';

@Injectable()
export class RemoveProductionHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<void> {
    const existing = await this.prisma.productionHistory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new ObjectNotFoundException('Registro de produção', 'id', id);
    }

    await this.prisma.productionHistory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
