import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@generated/prisma';
import { Roles, User } from '@shared/decorators';
import { CreateProductionHistoryDto } from './dto/create-production-history.dto';
import { UpdateProductionHistoryDto } from './dto/update-production-history.dto';
import {
  CreateProductionHistoryService,
  FindAllProductionHistoriesService,
  FindOneProductionHistoryService,
  UpdateProductionHistoryService,
  RemoveProductionHistoryService,
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
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateProductionHistoryDto) {
    return this.createProductionHistory.execute(dto);
  }

  @Get()
  findAll(
    @User('userId') userId: string,
    @User('role') role: UserRole,
    @Query('date') date?: string,
  ) {
    return this.findAllProductionHistories.execute(userId, role, date);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findOneProductionHistory.execute(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionHistoryDto,
    @User('role') role: UserRole,
  ) {
    return this.updateProductionHistory.execute(id, dto, role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.removeProductionHistory.execute(id);
  }
}
