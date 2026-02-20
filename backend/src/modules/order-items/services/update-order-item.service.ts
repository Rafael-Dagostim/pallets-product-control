import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { UpdateOrderItemDto } from '../dto/update-order-item.dto';
import { OrderItemEntity } from '../entities/order-item.entity';

@Injectable()
export class UpdateOrderItemService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateOrderItemDto): Promise<OrderItemEntity> {
    const existing = await this.prisma.orderItem.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new ObjectNotFoundException('Item do pedido', 'id', id);
    }

    const orderItem = await this.prisma.orderItem.update({
      where: { id },
      data: dto,
      include: { pallet: true },
    });

    return new OrderItemEntity(orderItem);
  }
}
