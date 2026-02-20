import { Order, OrderStatus } from '@generated/prisma';
import { CustomerEntity } from '@modules/customers/entities/customer.entity';
import { OrderItemEntity } from '@modules/order-items/entities/order-item.entity';

export class OrderEntity implements Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  customer?: CustomerEntity;
  items?: OrderItemEntity[];

  constructor(partial: Partial<OrderEntity>) {
    const customer =
      partial.customer && new CustomerEntity(partial.customer);
    const items =
      partial.items?.map((item) => new OrderItemEntity(item));
    Object.assign(this, { ...partial, customer, items });
  }
}
