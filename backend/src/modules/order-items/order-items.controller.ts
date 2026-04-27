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
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import {
  CreateOrderItemService,
  FindAllOrderItemsService,
  FindOneOrderItemService,
  UpdateOrderItemService,
  RemoveOrderItemService,
} from './services';

@Controller('order-items')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class OrderItemsController {
  constructor(
    private readonly createOrderItem: CreateOrderItemService,
    private readonly findAllOrderItems: FindAllOrderItemsService,
    private readonly findOneOrderItem: FindOneOrderItemService,
    private readonly updateOrderItem: UpdateOrderItemService,
    private readonly removeOrderItem: RemoveOrderItemService,
  ) {}

  @Post()
  create(@Body() dto: CreateOrderItemDto) {
    return this.createOrderItem.execute(dto);
  }

  @Get()
  findAll() {
    return this.findAllOrderItems.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findOneOrderItem.execute(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderItemDto,
  ) {
    return this.updateOrderItem.execute(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.removeOrderItem.execute(id);
  }
}
