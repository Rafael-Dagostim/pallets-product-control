import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { CreateProductionHistoryService } from './create-production-history.service';

describe('CreateProductionHistoryService', () => {
  let service: CreateProductionHistoryService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        CreateProductionHistoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CreateProductionHistoryService);
    jest.clearAllMocks();
  });

  const dto = { userId: 'emp-1', palletId: 'p-1', deliveredQuantity: 10 };

  const palletFixture = {
    id: 'p-1', name: 'A', version: 1, versionFromId: null,
    buyCost: 10, productionCost: 5, sellPrice: 20,
    createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  };

  function userFixture(role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN') {
    return {
      id: 'emp-1', name: 'A', login: 'AAA111', role,
      password: 'h',
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    };
  }

  it('creates OPEN record when target user is EMPLOYEE', async () => {
    prisma.user.findFirst.mockResolvedValue(userFixture('EMPLOYEE'));
    prisma.productionHistory.create.mockResolvedValue({
      id: 'ph-1', ...dto, reformedQuantity: 0, status: 'OPEN', observation: null,
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      user: userFixture('EMPLOYEE'), pallet: palletFixture,
    });

    const result = await service.execute(dto);

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'emp-1', deletedAt: null },
    });
    expect(prisma.productionHistory.create).toHaveBeenCalledWith({
      data: { userId: 'emp-1', palletId: 'p-1', deliveredQuantity: 10, status: 'OPEN' },
      include: {
        user: true,
        pallet: { select: { id: true, name: true, version: true } },
      },
    });
    expect(result.status).toBe('OPEN');
  });

  it('creates record when target user is MANAGER', async () => {
    prisma.user.findFirst.mockResolvedValue(userFixture('MANAGER'));
    prisma.productionHistory.create.mockResolvedValue({
      id: 'ph-1', ...dto, reformedQuantity: 0, status: 'OPEN', observation: null,
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      user: userFixture('MANAGER'), pallet: palletFixture,
    });

    await expect(service.execute(dto)).resolves.toBeDefined();
  });

  it('rejects when target user is ADMIN', async () => {
    prisma.user.findFirst.mockResolvedValue(userFixture('ADMIN'));
    await expect(service.execute(dto)).rejects.toThrow(BadRequestException);
    expect(prisma.productionHistory.create).not.toHaveBeenCalled();
  });

  it('throws ObjectNotFoundException when target user does not exist', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.execute(dto)).rejects.toThrow(ObjectNotFoundException);
  });
});
