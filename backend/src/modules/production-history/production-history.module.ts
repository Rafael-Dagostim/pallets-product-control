import { Module } from '@nestjs/common';
import { ProductionHistoryController } from './production-history.controller';
import {
  CreateProductionHistoryService,
  FindAllProductionHistoriesService,
  FindOneProductionHistoryService,
  UpdateProductionHistoryService,
  RemoveProductionHistoryService,
} from './services';

@Module({
  controllers: [ProductionHistoryController],
  providers: [
    CreateProductionHistoryService,
    FindAllProductionHistoriesService,
    FindOneProductionHistoryService,
    UpdateProductionHistoryService,
    RemoveProductionHistoryService,
  ],
})
export class ProductionHistoryModule {}
