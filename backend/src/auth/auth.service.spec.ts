import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@core/database/database.service';
import { AuthService } from './auth.service';
import { createMockPrismaService, MockPrismaService } from '../__mocks__/prisma.mock';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: MockPrismaService;
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  const pepper = 'test-pepper';

  beforeEach(async () => {
    prisma = createMockPrismaService();
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
      verify: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(pepper), getOrThrow: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user, token and refresh on valid login', async () => {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('password123' + pepper, salt);

      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        name: 'Test',
        document: '12345678900',
        role: 'ADMIN',
        password: hashedPassword,
        salt,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        document: '12345678900',
        password: 'password123',
      });

      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('user-1');
      expect(result.token).toBe('jwt-token');
      expect(result.refresh).toBe('jwt-token');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ document: '00000000000', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('correct' + pepper, salt);

      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        password: hashedPassword,
        salt,
      });

      await expect(
        service.login({ document: '12345678900', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return new token and refresh on valid refresh token', async () => {
      jwtService.verify.mockReturnValue({ userId: 'user-1', role: 'ADMIN' });
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        name: 'Test',
        role: 'ADMIN',
      });
      jwtService.sign.mockReturnValue('new-token');

      const result = await service.refreshToken({ token: 'valid-refresh' });

      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-1', deletedAt: null },
      });
      expect(result.token).toBe('new-token');
      expect(result.refresh).toBe('new-token');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException on invalid/expired token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(
        service.refreshToken({ token: 'expired-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user no longer exists', async () => {
      jwtService.verify.mockReturnValue({ userId: 'deleted-user', role: 'ADMIN' });
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.refreshToken({ token: 'valid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
