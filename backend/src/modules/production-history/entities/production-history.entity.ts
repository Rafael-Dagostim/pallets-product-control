import { ProductionHistory, ProductionStatus } from '@generated/prisma';
import { UserEntity } from '@modules/users/entities/user.entity';

/** Minimal pallet projection embedded in production responses (no pricing). */
export type ProductionPalletSummary = {
  id: string;
  name: string;
  version: number;
};

export class ProductionHistoryEntity implements ProductionHistory {
  id: string;
  userId: string;
  palletId: string;
  deliveredQuantity: number;
  reformedQuantity: number;
  status: ProductionStatus;
  observation: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  user?: UserEntity;
  pallet?: ProductionPalletSummary;

  constructor(partial: Partial<ProductionHistoryEntity>) {
    const user = partial.user && new UserEntity(partial.user);
    Object.assign(this, { ...partial, user });
  }
}
