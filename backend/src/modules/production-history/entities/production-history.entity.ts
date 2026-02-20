import { ProductionHistory, ProductionStatus } from '@generated/prisma';
import { UserEntity } from '@modules/users/entities/user.entity';
import { PalletEntity } from '@modules/pallets/entities/pallet.entity';

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
  pallet?: PalletEntity;

  constructor(partial: Partial<ProductionHistoryEntity>) {
    const user = partial.user && new UserEntity(partial.user);
    const pallet = partial.pallet && new PalletEntity(partial.pallet);
    Object.assign(this, { ...partial, user, pallet });
  }
}
