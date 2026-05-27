import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ProductionStatus, UserRole } from '@generated/prisma';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { UpdateProductionHistoryDto } from '../dto/update-production-history.dto';
import { ProductionHistoryEntity } from '../entities/production-history.entity';

const ALLOWED_TRANSITIONS: Record<ProductionStatus, ProductionStatus[]> = {
  OPEN: [ProductionStatus.VERIFIED, ProductionStatus.CANCELED],
  VERIFIED: [ProductionStatus.PAID, ProductionStatus.CANCELED],
  CANCELED: [],
  PAID: [],
};

@Injectable()
export class UpdateProductionHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateProductionHistoryDto,
    actorRole: UserRole,
  ): Promise<ProductionHistoryEntity> {
    const existing = await this.prisma.productionHistory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new ObjectNotFoundException('Registro de produção', 'id', id);
    }

    if (actorRole !== UserRole.ADMIN && !isSameDay(existing.createdAt, new Date())) {
      throw new ForbiddenException(
        'Apenas administradores podem alterar registros de outros dias.',
      );
    }

    const data: {
      status?: ProductionStatus;
      reformedQuantity?: number;
      observation?: string | null;
    } = {};

    if (dto.status && dto.status !== existing.status) {
      const allowed = ALLOWED_TRANSITIONS[existing.status];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Transição inválida: ${existing.status} → ${dto.status}.`,
        );
      }

      if (dto.status === ProductionStatus.VERIFIED) {
        if (dto.reformedQuantity === undefined || dto.reformedQuantity === null) {
          throw new BadRequestException(
            'Quantidade reformada é obrigatória ao verificar.',
          );
        }
        if (dto.reformedQuantity > existing.deliveredQuantity) {
          throw new BadRequestException(
            'Quantidade reformada não pode exceder a entregue.',
          );
        }
        data.reformedQuantity = dto.reformedQuantity;
      }

      if (dto.status === ProductionStatus.CANCELED) {
        if (!dto.observation || !dto.observation.trim()) {
          throw new BadRequestException(
            'Observação é obrigatória ao cancelar.',
          );
        }
        data.observation = dto.observation.trim();
      }

      data.status = dto.status;
    } else {
      if (dto.reformedQuantity !== undefined) {
        data.reformedQuantity = dto.reformedQuantity;
      }
      if (dto.observation !== undefined) {
        data.observation = dto.observation;
      }
    }

    const record = await this.prisma.productionHistory.update({
      where: { id },
      data,
      include: {
        user: true,
        pallet: { select: { id: true, name: true, version: true } },
      },
    });

    return new ProductionHistoryEntity(record);
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
