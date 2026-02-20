import { UserRole } from '@generated/prisma';

export type JwtPayload = {
  userId: string;
  role: UserRole;
};
