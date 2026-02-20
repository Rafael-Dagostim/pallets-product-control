import { Customer } from '@generated/prisma';

export class CustomerEntity implements Customer {
  id: string;
  businessName: string;
  corporateName: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(partial: Partial<CustomerEntity>) {
    Object.assign(this, partial);
  }
}
