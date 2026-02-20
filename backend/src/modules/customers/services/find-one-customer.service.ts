import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { CustomerEntity } from '../entities/customer.entity';

@Injectable()
export class FindOneCustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<CustomerEntity> {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });

    if (!customer) {
      throw new ObjectNotFoundException('Cliente', 'id', id);
    }

    return new CustomerEntity(customer);
  }
}
