import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { CustomerEntity } from '../entities/customer.entity';

@Injectable()
export class FindAllCustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CustomerEntity[]> {
    const customers = await this.prisma.customer.findMany({
      where: { deletedAt: null },
    });

    return customers.map((customer) => new CustomerEntity(customer));
  }
}
