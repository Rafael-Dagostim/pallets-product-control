import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerEntity } from '../entities/customer.entity';

@Injectable()
export class UpdateCustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateCustomerDto): Promise<CustomerEntity> {
    const existing = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new ObjectNotFoundException('Cliente', 'id', id);
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data: dto,
    });

    return new CustomerEntity(customer);
  }
}
