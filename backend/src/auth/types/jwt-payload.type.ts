import { UserRole } from '@generated/prisma';

export type TokenType = 'access' | 'refresh';

export type JwtPayload = {
  userId: string;
  role: UserRole;
  type?: TokenType;
};
