import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';

@Injectable()
export class RemoveOrderItemService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<void> {
    const existing = await this.prisma.orderItem.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new ObjectNotFoundException('Item do pedido', 'id', id);
    }

    await this.prisma.orderItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
