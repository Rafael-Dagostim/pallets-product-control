import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { PalletEntity } from '../entities/pallet.entity';

@Injectable()
export class FindAllPalletsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<PalletEntity[]> {
    const pallets = await this.prisma.pallet.findMany({
      where: { deletedAt: null },
    });

    return pallets.map((pallet) => new PalletEntity(pallet));
  }
}
