import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { CreatePalletDto } from '../dto/create-pallet.dto';
import { PalletEntity } from '../entities/pallet.entity';

@Injectable()
export class CreatePalletService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreatePalletDto): Promise<PalletEntity> {
    let version = 1;

    if (dto.versionFromId) {
      const origin = await this.prisma.pallet.findFirst({
        where: { id: dto.versionFromId, deletedAt: null },
      });

      if (!origin) {
        throw new ObjectNotFoundException('Pallet', 'id', dto.versionFromId);
      }

      const latest = await this.prisma.pallet.findFirst({
        where: { name: origin.name, deletedAt: null },
        orderBy: { version: 'desc' },
      });

      version = (latest?.version ?? 0) + 1;
    }

    const pallet = await this.prisma.pallet.create({
      data: {
        name: dto.name,
        buyCost: dto.buyCost,
        productionCost: dto.productionCost,
        sellPrice: dto.sellPrice,
        versionFromId: dto.versionFromId || null,
        version,
      },
    });

    return new PalletEntity(pallet);
  }
}
