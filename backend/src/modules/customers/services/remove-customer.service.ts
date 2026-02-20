import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';

@Injectable()
export class RemoveCustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<void> {
    const existing = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new ObjectNotFoundException('Cliente', 'id', id);
    }

    await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
