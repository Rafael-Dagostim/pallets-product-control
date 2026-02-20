import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CustomerEntity } from '../entities/customer.entity';

@Injectable()
export class CreateCustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateCustomerDto): Promise<CustomerEntity> {
    const customer = await this.prisma.customer.create({
      data: dto,
    });

    return new CustomerEntity(customer);
  }
}
