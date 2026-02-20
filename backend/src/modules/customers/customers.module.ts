import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import {
  CreateCustomerService,
  FindAllCustomersService,
  FindOneCustomerService,
  UpdateCustomerService,
  RemoveCustomerService,
} from './services';

@Module({
  controllers: [CustomersController],
  providers: [
    CreateCustomerService,
    FindAllCustomersService,
    FindOneCustomerService,
    UpdateCustomerService,
    RemoveCustomerService,
  ],
})
export class CustomersModule {}
