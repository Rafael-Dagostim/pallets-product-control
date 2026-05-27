import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RoleGuard(reflector);
  });

  const createContext = (role = 'ADMIN'): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    }) as any;

  it('should return true when route is public', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(true); // IS_PUBLIC_KEY
    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('should DENY by default when no @Roles decorator (deny-by-default)', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(false)  // IS_PUBLIC_KEY
      .mockReturnValueOnce(null);  // ROLES_KEY
    expect(guard.canActivate(createContext())).toBe(false);
  });

  it('should DENY by default when empty roles array', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([]);
    expect(guard.canActivate(createContext())).toBe(false);
  });

  it('should return true when user role matches', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['ADMIN', 'MANAGER']);
    expect(guard.canActivate(createContext('ADMIN'))).toBe(true);
  });

  it('should return false when user role does not match', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['ADMIN']);
    expect(guard.canActivate(createContext('EMPLOYEE'))).toBe(false);
  });
});
