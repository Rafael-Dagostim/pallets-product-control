import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { UpdateUserService } from './update-user.service';

describe('UpdateUserService', () => {
  let service: UpdateUserService;
  let prisma: MockPrismaService;
  const originalEnv = process.env.PWD_PEPPER;

  beforeEach(async () => {
    process.env.PWD_PEPPER = 'test-pepper';
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        UpdateUserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UpdateUserService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.PWD_PEPPER = originalEnv;
  });

  it('should update user without re-hashing when no password change', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u-1' });
    prisma.user.update.mockResolvedValue({
      id: 'u-1', name: 'Updated', document: '111', role: 'ADMIN',
      password: 'h', salt: 's', createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const result = await service.execute('u-1', { name: 'Updated' } as any);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      data: { name: 'Updated' },
    });
    expect(result.name).toBe('Updated');
  });

  it('should re-hash password when password is provided', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u-1' });
    prisma.user.update.mockImplementation(async ({ data }) => ({
      id: 'u-1', name: 'A', document: '111', role: 'ADMIN',
      password: data.password, salt: data.salt,
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    }));

    await service.execute('u-1', { password: 'newpass' } as any);

    const callData = prisma.user.update.mock.calls[0][0].data;
    expect(callData.salt).toBeDefined();
    const isValid = await bcrypt.compare('newpass' + 'test-pepper', callData.password as string);
    expect(isValid).toBe(true);
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found', {} as any)).rejects.toThrow(ObjectNotFoundException);
  });
});
