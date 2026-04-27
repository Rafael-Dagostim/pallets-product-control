import { Module } from '@nestjs/common';
import { ProductionHistoryController } from './production-history.controller';
import {
  CreateProductionHistoryService,
  FindAllProductionHistoriesService,
  FindOneProductionHistoryService,
  UpdateProductionHistoryService,
  RemoveProductionHistoryService,
  BulkPayProductionHistoryService,
} from './services';

@Module({
  controllers: [ProductionHistoryController],
  providers: [
    CreateProductionHistoryService,
    FindAllProductionHistoriesService,
    FindOneProductionHistoryService,
    UpdateProductionHistoryService,
    RemoveProductionHistoryService,
    BulkPayProductionHistoryService,
  ],
})
export class ProductionHistoryModule {}
