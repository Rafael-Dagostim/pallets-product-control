import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderEntity } from '../entities/order.entity';

@Injectable()
export class UpdateOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateOrderDto): Promise<OrderEntity> {
    const existing = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new ObjectNotFoundException('Pedido', 'id', id);
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
      include: {
        customer: true,
        items: { include: { pallet: true } },
      },
    });

    return new OrderEntity(order);
  }
}
