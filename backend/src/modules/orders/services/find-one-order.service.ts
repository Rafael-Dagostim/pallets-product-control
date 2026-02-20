import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { OrderEntity } from '../entities/order.entity';

@Injectable()
export class FindOneOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<OrderEntity> {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        items: { include: { pallet: true } },
      },
    });

    if (!order) {
      throw new ObjectNotFoundException('Pedido', 'id', id);
    }

    return new OrderEntity(order);
  }
}
