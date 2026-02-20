import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock; refreshToken: jest.Mock };

  beforeEach(async () => {
    authService = { login: jest.fn(), refreshToken: jest.fn() };

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('should delegate login to AuthService', async () => {
    const dto = { document: '12345678900', password: 'pass' };
    const expected = { token: 'jwt' };
    authService.login.mockResolvedValue(expected);

    const result = await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(result).toBe(expected);
  });

  it('should delegate refresh to AuthService', async () => {
    const dto = { token: 'refresh-token' };
    const expected = { token: 'new-jwt', refresh: 'new-refresh' };
    authService.refreshToken.mockResolvedValue(expected);

    const result = await controller.refresh(dto);

    expect(authService.refreshToken).toHaveBeenCalledWith(dto);
    expect(result).toBe(expected);
  });
});
