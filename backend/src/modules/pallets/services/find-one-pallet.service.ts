import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { PalletEntity } from '../entities/pallet.entity';

@Injectable()
export class FindOnePalletService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<PalletEntity> {
    const pallet = await this.prisma.pallet.findFirst({
      where: { id, deletedAt: null },
    });

    if (!pallet) {
      throw new ObjectNotFoundException('Pallet', 'id', id);
    }

    return new PalletEntity(pallet);
  }
}
