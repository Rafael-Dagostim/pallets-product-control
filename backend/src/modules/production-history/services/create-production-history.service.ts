import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ProductionStatus, UserRole } from '@generated/prisma';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { CreateProductionHistoryDto } from '../dto/create-production-history.dto';
import { ProductionHistoryEntity } from '../entities/production-history.entity';

@Injectable()
export class CreateProductionHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: CreateProductionHistoryDto,
  ): Promise<ProductionHistoryEntity> {
    const targetUser = await this.prisma.user.findFirst({
      where: { id: dto.userId, deletedAt: null },
    });

    if (!targetUser) {
      throw new ObjectNotFoundException('Colaborador', 'id', dto.userId);
    }

    if (
      targetUser.role !== UserRole.EMPLOYEE &&
      targetUser.role !== UserRole.MANAGER
    ) {
      throw new BadRequestException(
        'Apenas colaboradores ou gerentes podem ter uma produção aberta.',
      );
    }

    const record = await this.prisma.productionHistory.create({
      data: {
        userId: dto.userId,
        palletId: dto.palletId,
        deliveredQuantity: dto.deliveredQuantity,
        status: ProductionStatus.OPEN,
      },
      include: {
        user: true,
        pallet: { select: { id: true, name: true, version: true } },
      },
    });

    return new ProductionHistoryEntity(record);
  }
}
