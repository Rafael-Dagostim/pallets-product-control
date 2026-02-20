import { Module } from '@nestjs/common';
import { OrderItemsController } from './order-items.controller';
import {
  CreateOrderItemService,
  FindAllOrderItemsService,
  FindOneOrderItemService,
  UpdateOrderItemService,
  RemoveOrderItemService,
} from './services';

@Module({
  controllers: [OrderItemsController],
  providers: [
    CreateOrderItemService,
    FindAllOrderItemsService,
    FindOneOrderItemService,
    UpdateOrderItemService,
    RemoveOrderItemService,
  ],
})
export class OrderItemsModule {}
