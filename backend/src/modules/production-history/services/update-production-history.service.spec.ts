import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { UserRole } from '@generated/prisma';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { UpdateProductionHistoryService } from './update-production-history.service';

describe('UpdateProductionHistoryService', () => {
  let service: UpdateProductionHistoryService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        UpdateProductionHistoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UpdateProductionHistoryService);
    jest.clearAllMocks();
  });

  const palletFixture = {
    id: 'p-1', name: 'A', version: 1, versionFromId: null,
    buyCost: 10, productionCost: 5, sellPrice: 20,
    createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  };
  const userFixture = {
    id: 'u-1', name: 'A', document: '111', role: 'EMPLOYEE',
    password: 'h', salt: 's',
    createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  };

  function existing(overrides: Partial<any> = {}) {
    return {
      id: 'ph-1', userId: 'u-1', palletId: 'p-1',
      deliveredQuantity: 10, reformedQuantity: 0,
      status: 'OPEN', observation: null,
      createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
      ...overrides,
    };
  }

  function mockUpdateReturn() {
    prisma.productionHistory.update.mockImplementation(async (args) => ({
      ...existing(), ...args.data,
      user: userFixture, pallet: palletFixture,
    }));
  }

  it('throws ObjectNotFoundException when not found', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(null);
    await expect(service.execute('x', {}, UserRole.ADMIN)).rejects.toThrow(ObjectNotFoundException);
  });

  it('forbids non-admin from editing records from past days', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    prisma.productionHistory.findFirst.mockResolvedValue(existing({ createdAt: pastDate }));

    await expect(
      service.execute('ph-1', { status: 'VERIFIED', reformedQuantity: 5 }, UserRole.MANAGER),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows admin to edit records from past days', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    prisma.productionHistory.findFirst.mockResolvedValue(existing({ createdAt: pastDate }));
    mockUpdateReturn();

    const result = await service.execute(
      'ph-1', { status: 'VERIFIED', reformedQuantity: 5 }, UserRole.ADMIN,
    );
    expect(result.status).toBe('VERIFIED');
  });

  it('transitions OPEN → VERIFIED with reformedQuantity', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(existing());
    mockUpdateReturn();

    const result = await service.execute(
      'ph-1', { status: 'VERIFIED', reformedQuantity: 7 }, UserRole.MANAGER,
    );

    expect(prisma.productionHistory.update).toHaveBeenCalledWith({
      where: { id: 'ph-1' },
      data: { status: 'VERIFIED', reformedQuantity: 7 },
      include: { user: true, pallet: true },
    });
    expect(result.status).toBe('VERIFIED');
  });

  it('rejects VERIFIED without reformedQuantity', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(existing());
    await expect(
      service.execute('ph-1', { status: 'VERIFIED' }, UserRole.MANAGER),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects VERIFIED when reformedQuantity exceeds delivered', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(existing({ deliveredQuantity: 5 }));
    await expect(
      service.execute('ph-1', { status: 'VERIFIED', reformedQuantity: 10 }, UserRole.MANAGER),
    ).rejects.toThrow(BadRequestException);
  });

  it('transitions VERIFIED → PAID', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(existing({ status: 'VERIFIED', reformedQuantity: 5 }));
    mockUpdateReturn();

    const result = await service.execute('ph-1', { status: 'PAID' }, UserRole.ADMIN);
    expect(result.status).toBe('PAID');
  });

  it('rejects OPEN → PAID (skipping VERIFIED)', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(existing());
    await expect(
      service.execute('ph-1', { status: 'PAID' }, UserRole.ADMIN),
    ).rejects.toThrow(BadRequestException);
  });

  it('cancels with observation', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(existing());
    mockUpdateReturn();

    const result = await service.execute(
      'ph-1', { status: 'CANCELED', observation: 'motivo' }, UserRole.MANAGER,
    );

    expect(prisma.productionHistory.update).toHaveBeenCalledWith({
      where: { id: 'ph-1' },
      data: { status: 'CANCELED', observation: 'motivo' },
      include: { user: true, pallet: true },
    });
    expect(result.status).toBe('CANCELED');
  });

  it('rejects cancel without observation', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(existing());
    await expect(
      service.execute('ph-1', { status: 'CANCELED' }, UserRole.MANAGER),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects transitions from terminal CANCELED', async () => {
    prisma.productionHistory.findFirst.mockResolvedValue(existing({ status: 'CANCELED' }));
    await expect(
      service.execute('ph-1', { status: 'VERIFIED', reformedQuantity: 1 }, UserRole.ADMIN),
    ).rejects.toThrow(BadRequestException);
  });
});
