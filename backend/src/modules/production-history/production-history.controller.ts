import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@shared/decorators';
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
  create(
    @Body() dto: CreateProductionHistoryDto,
    @User('userId') userId: string,
  ) {
    return this.createProductionHistory.execute(dto, userId);
  }

  @Get()
  findAll() {
    return this.findAllProductionHistories.execute();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findOneProductionHistory.execute(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionHistoryDto,
  ) {
    return this.updateProductionHistory.execute(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.removeProductionHistory.execute(id);
  }
}
