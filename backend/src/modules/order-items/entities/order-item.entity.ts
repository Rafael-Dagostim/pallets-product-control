import { OrderItem } from '@generated/prisma';
import { PalletEntity } from '@modules/pallets/entities/pallet.entity';

export class OrderItemEntity implements OrderItem {
  id: string;
  orderId: string;
  palletId: string;
  quantityRequested: number;
  quantityProduced: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  pallet?: PalletEntity;

  constructor(partial: Partial<OrderItemEntity>) {
    const pallet = partial.pallet && new PalletEntity(partial.pallet);
    Object.assign(this, { ...partial, pallet });
  }
}
