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
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  CreateOrderService,
  FindAllOrdersService,
  FindOneOrderService,
  UpdateOrderService,
  RemoveOrderService,
} from './services';

@Controller('orders')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderService,
    private readonly findAllOrders: FindAllOrdersService,
    private readonly findOneOrder: FindOneOrderService,
    private readonly updateOrder: UpdateOrderService,
    private readonly removeOrder: RemoveOrderService,
  ) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.createOrder.execute(dto);
  }

  @Get()
  findAll() {
    return this.findAllOrders.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findOneOrder.execute(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.updateOrder.execute(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.removeOrder.execute(id);
  }
}
