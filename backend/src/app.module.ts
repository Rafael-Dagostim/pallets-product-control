import { Module } from '@nestjs/common';
import { DatabaseModule } from './core/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { PalletsModule } from './modules/pallets/pallets.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrderItemsModule } from './modules/order-items/order-items.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductionHistoryModule } from './modules/production-history/production-history.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    PalletsModule,
    CustomersModule,
    OrderItemsModule,
    OrdersModule,
    ProductionHistoryModule,
  ],
})
export class AppModule {}
