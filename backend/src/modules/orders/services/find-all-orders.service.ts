import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { OrderEntity } from '../entities/order.entity';

@Injectable()
export class FindAllOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        customer: true,
        items: { include: { pallet: true } },
      },
    });

    return orders.map((order) => new OrderEntity(order));
  }
}
