import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new JwtAuthGuard(reflector);
  });

  const createContext = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as any;

  it('should return true when route is public', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('should delegate to parent when route is not public', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const spy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(createContext());
    expect(spy).toHaveBeenCalled();
    expect(result).toBe(true);
    spy.mockRestore();
  });
});
