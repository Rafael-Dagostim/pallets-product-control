import { Pallet } from '@generated/prisma';
import { Decimal } from '@prisma/client/runtime/client';

export class PalletEntity implements Pallet {
  id: string;
  name: string;
  version: number;
  versionFromId: string | null;
  buyCost: Decimal;
  productionCost: Decimal;
  sellPrice: Decimal;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(partial: Partial<PalletEntity>) {
    Object.assign(this, partial);
  }
}
