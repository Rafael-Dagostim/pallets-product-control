import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@generated/prisma';
import { Roles, User } from '@shared/decorators';
import { CreateProductionHistoryDto } from './dto/create-production-history.dto';
import { UpdateProductionHistoryDto } from './dto/update-production-history.dto';
import { FindAllProductionHistoriesDto } from './dto/find-all-production-histories.dto';
import { BulkPayProductionHistoryDto } from './dto/bulk-pay-production-history.dto';
import {
  CreateProductionHistoryService,
  FindAllProductionHistoriesService,
  FindOneProductionHistoryService,
  UpdateProductionHistoryService,
  RemoveProductionHistoryService,
  BulkPayProductionHistoryService,
} from './services';

@Controller('production-history')
@ApiBearerAuth()
export class ProductionHistoryController {
  constructor(
    private readonly createProductionHistory: CreateProductionHistoryService,
    private readonly findAllProductionHistories: FindAllProductionHistoriesService,
    private readonly findOneProductionHistory: FindOneProductionHistoryService,
    private readonly updateProductionHistory: UpdateProductionHistoryService,
    private readonly removeProductionHistory: RemoveProductionHistoryService,
    private readonly bulkPayProductionHistory: BulkPayProductionHistoryService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateProductionHistoryDto) {
    return this.createProductionHistory.execute(dto);
  }

  @Post('bulk-pay')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  bulkPay(@Body() dto: BulkPayProductionHistoryDto) {
    return this.bulkPayProductionHistory.execute(dto.ids);
  }

  @Get()
  findAll(
    @User('userId') userId: string,
    @User('role') role: UserRole,
    @Query() query: FindAllProductionHistoriesDto,
  ) {
    return this.findAllProductionHistories.execute(userId, role, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findOneProductionHistory.execute(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductionHistoryDto,
    @User('role') role: UserRole,
  ) {
    return this.updateProductionHistory.execute(id, dto, role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.removeProductionHistory.execute(id);
  }
}
