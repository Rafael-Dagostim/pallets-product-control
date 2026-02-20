import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import {
  CreateOrderService,
  FindAllOrdersService,
  FindOneOrderService,
  UpdateOrderService,
  RemoveOrderService,
} from './services';

@Module({
  controllers: [OrdersController],
  providers: [
    CreateOrderService,
    FindAllOrdersService,
    FindOneOrderService,
    UpdateOrderService,
    RemoveOrderService,
  ],
})
export class OrdersModule {}
