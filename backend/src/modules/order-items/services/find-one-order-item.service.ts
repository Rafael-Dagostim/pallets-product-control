import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { OrderItemEntity } from '../entities/order-item.entity';

@Injectable()
export class FindOneOrderItemService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<OrderItemEntity> {
    const orderItem = await this.prisma.orderItem.findFirst({
      where: { id, deletedAt: null },
      include: { pallet: true },
    });

    if (!orderItem) {
      throw new ObjectNotFoundException('Item do pedido', 'id', id);
    }

    return new OrderItemEntity(orderItem);
  }
}
