import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { OrderItemEntity } from '../entities/order-item.entity';

@Injectable()
export class FindAllOrderItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<OrderItemEntity[]> {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { deletedAt: null },
      include: { pallet: true },
    });

    return orderItems.map((item) => new OrderItemEntity(item));
  }
}
