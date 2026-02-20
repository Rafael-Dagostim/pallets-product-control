import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ProductionStatus } from '@generated/prisma';
import { CreateProductionHistoryDto } from '../dto/create-production-history.dto';
import { ProductionHistoryEntity } from '../entities/production-history.entity';

@Injectable()
export class CreateProductionHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: CreateProductionHistoryDto,
    userId: string,
  ): Promise<ProductionHistoryEntity> {
    const record = await this.prisma.productionHistory.create({
      data: {
        ...dto,
        userId,
        status: ProductionStatus.OPEN,
      },
      include: { user: true, pallet: true },
    });

    return new ProductionHistoryEntity(record);
  }
}
