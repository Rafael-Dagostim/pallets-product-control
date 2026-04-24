import { Pallet } from '@generated/prisma';
import { Decimal } from '@prisma/client/runtime/client';
import { Transform } from 'class-transformer';

export class PalletEntity implements Pallet {
  id: string;
  name: string;
  version: number;
  versionFromId: string | null;

  @Transform(({ value }) => value instanceof Decimal ? value.toNumber() : Number(value))
  buyCost: Decimal;

  @Transform(({ value }) => value instanceof Decimal ? value.toNumber() : Number(value))
  productionCost: Decimal;

  @Transform(({ value }) => value instanceof Decimal ? value.toNumber() : Number(value))
  sellPrice: Decimal;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(partial: Partial<PalletEntity>) {
    Object.assign(this, partial);
  }
}
