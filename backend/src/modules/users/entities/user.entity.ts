import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { User, UserRole } from '@generated/prisma';

export class UserEntity implements User {
  id: string;
  name: string;
  document: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  @Exclude()
  @ApiHideProperty()
  password: string;

  @Exclude()
  @ApiHideProperty()
  salt: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
