import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@generated/prisma';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const config = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
    strategy = new JwtStrategy(config);
  });

  it('accepts an access token and returns userId/role', () => {
    const result = strategy.validate({
      userId: 'u-1',
      role: UserRole.ADMIN,
      type: 'access',
    });
    expect(result).toEqual({ userId: 'u-1', role: UserRole.ADMIN });
  });

  it('accepts a legacy token without a type (backward compatible)', () => {
    const result = strategy.validate({ userId: 'u-1', role: UserRole.EMPLOYEE });
    expect(result).toEqual({ userId: 'u-1', role: UserRole.EMPLOYEE });
  });

  it('rejects a refresh token used as a bearer credential', () => {
    expect(() =>
      strategy.validate({ userId: 'u-1', role: UserRole.ADMIN, type: 'refresh' }),
    ).toThrow(UnauthorizedException);
  });
});
