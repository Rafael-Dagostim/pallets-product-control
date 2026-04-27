import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@generated/prisma';
import { Roles } from '@shared/decorators';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import {
  CreateCustomerService,
  FindAllCustomersService,
  FindOneCustomerService,
  UpdateCustomerService,
  RemoveCustomerService,
} from './services';

@Controller('customers')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class CustomersController {
  constructor(
    private readonly createCustomer: CreateCustomerService,
    private readonly findAllCustomers: FindAllCustomersService,
    private readonly findOneCustomer: FindOneCustomerService,
    private readonly updateCustomer: UpdateCustomerService,
    private readonly removeCustomer: RemoveCustomerService,
  ) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.createCustomer.execute(dto);
  }

  @Get()
  findAll() {
    return this.findAllCustomers.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findOneCustomer.execute(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.updateCustomer.execute(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.removeCustomer.execute(id);
  }
}
