import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { CreateOrderItemDto } from '../dto/create-order-item.dto';
import { OrderItemEntity } from '../entities/order-item.entity';

@Injectable()
export class CreateOrderItemService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateOrderItemDto): Promise<OrderItemEntity> {
    const orderItem = await this.prisma.orderItem.create({
      data: dto,
      include: { pallet: true },
    });

    return new OrderItemEntity(orderItem);
  }
}
