import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { OrderStatus } from '@generated/prisma';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderEntity } from '../entities/order.entity';

@Injectable()
export class CreateOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateOrderDto): Promise<OrderEntity> {
    const order = await this.prisma.order.create({
      data: {
        customerId: dto.customerId,
        deadline: new Date(dto.deadline),
        status: OrderStatus.OPEN,
        items: {
          create: dto.items.map((item) => ({
            palletId: item.palletId,
            quantityRequested: item.quantityRequested,
          })),
        },
      },
      include: {
        customer: true,
        items: { include: { pallet: true } },
      },
    });

    return new OrderEntity(order);
  }
}
