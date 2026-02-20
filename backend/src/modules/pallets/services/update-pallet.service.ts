import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { UpdatePalletDto } from '../dto/update-pallet.dto';
import { PalletEntity } from '../entities/pallet.entity';

@Injectable()
export class UpdatePalletService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdatePalletDto): Promise<PalletEntity> {
    const existing = await this.prisma.pallet.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new ObjectNotFoundException('Pallet', 'id', id);
    }

    const pallet = await this.prisma.pallet.update({
      where: { id },
      data: dto,
    });

    return new PalletEntity(pallet);
  }
}
