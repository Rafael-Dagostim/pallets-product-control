import { Test } from '@nestjs/testing';
import { UserRole } from '@generated/prisma';
import { ProductionHistoryController } from './production-history.controller';
import {
  CreateProductionHistoryService,
  FindAllProductionHistoriesService,
  FindOneProductionHistoryService,
  UpdateProductionHistoryService,
  RemoveProductionHistoryService,
  BulkPayProductionHistoryService,
} from './services';

describe('ProductionHistoryController', () => {
  let controller: ProductionHistoryController;
  const mockService = () => ({ execute: jest.fn() });

  let createPH: { execute: jest.Mock };
  let findAllPH: { execute: jest.Mock };
  let findOnePH: { execute: jest.Mock };
  let updatePH: { execute: jest.Mock };
  let removePH: { execute: jest.Mock };
  let bulkPayPH: { execute: jest.Mock };

  beforeEach(async () => {
    createPH = mockService();
    findAllPH = mockService();
    findOnePH = mockService();
    updatePH = mockService();
    removePH = mockService();
    bulkPayPH = mockService();

    const module = await Test.createTestingModule({
      controllers: [ProductionHistoryController],
      providers: [
        { provide: CreateProductionHistoryService, useValue: createPH },
        { provide: FindAllProductionHistoriesService, useValue: findAllPH },
        { provide: FindOneProductionHistoryService, useValue: findOnePH },
        { provide: UpdateProductionHistoryService, useValue: updatePH },
        { provide: RemoveProductionHistoryService, useValue: removePH },
        { provide: BulkPayProductionHistoryService, useValue: bulkPayPH },
      ],
    }).compile();

    controller = module.get(ProductionHistoryController);
    jest.clearAllMocks();
  });

  it('delegates create', async () => {
    const dto = { userId: 'emp-1', palletId: 'p-1', deliveredQuantity: 10 } as any;
    createPH.execute.mockResolvedValue({ id: '1' });
    expect(await controller.create(dto)).toEqual({ id: '1' });
    expect(createPH.execute).toHaveBeenCalledWith(dto);
  });

  it('delegates findAll with from/to range', async () => {
    findAllPH.execute.mockResolvedValue([]);
    const query = {
      from: '2026-04-24T03:00:00.000Z',
      to: '2026-04-25T02:59:59.999Z',
    };
    await controller.findAll('user-1', UserRole.ADMIN, query);
    expect(findAllPH.execute).toHaveBeenCalledWith('user-1', UserRole.ADMIN, query);
  });

  it('delegates findOne', async () => {
    findOnePH.execute.mockResolvedValue({ id: '1' });
    expect(await controller.findOne('1')).toEqual({ id: '1' });
  });

  it('delegates update with role', async () => {
    const dto = { status: 'VERIFIED', reformedQuantity: 5 } as any;
    updatePH.execute.mockResolvedValue({ id: '1' });
    await controller.update('1', dto, UserRole.ADMIN);
    expect(updatePH.execute).toHaveBeenCalledWith('1', dto, UserRole.ADMIN);
  });

  it('delegates remove', async () => {
    removePH.execute.mockResolvedValue(undefined);
    await controller.remove('1');
    expect(removePH.execute).toHaveBeenCalledWith('1');
  });
});
