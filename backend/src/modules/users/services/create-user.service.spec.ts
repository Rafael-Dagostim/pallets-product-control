import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@core/database/database.service';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { CreateUserService } from './create-user.service';

describe('CreateUserService', () => {
  let service: CreateUserService;
  let prisma: MockPrismaService;
  const pepper = 'test-pepper';

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        CreateUserService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(pepper) },
        },
      ],
    }).compile();

    service = module.get(CreateUserService);
    jest.clearAllMocks();
  });

  it('should hash password with pepper and create user', async () => {
    const dto = { name: 'John', login: 'JOHN123', password: 'secret', role: 'EMPLOYEE' as const };
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'u-1',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }));

    const result = await service.execute(dto as any);

    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    const callData = prisma.user.create.mock.calls[0][0].data;
    expect(callData.salt).toBeDefined();
    expect(callData.password).not.toBe('secret');

    const isValid = await bcrypt.compare('secret' + pepper, callData.password);
    expect(isValid).toBe(true);
    expect(result.id).toBe('u-1');
  });
});
