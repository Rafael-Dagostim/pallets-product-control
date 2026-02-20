import { Test } from '@nestjs/testing';
import { ProductionHistoryController } from './production-history.controller';
import {
  CreateProductionHistoryService,
  FindAllProductionHistoriesService,
  FindOneProductionHistoryService,
  UpdateProductionHistoryService,
  RemoveProductionHistoryService,
} from './services';

describe('ProductionHistoryController', () => {
  let controller: ProductionHistoryController;
  const mockService = () => ({ execute: jest.fn() });

  let createPH: { execute: jest.Mock };
  let findAllPH: { execute: jest.Mock };
  let findOnePH: { execute: jest.Mock };
  let updatePH: { execute: jest.Mock };
  let removePH: { execute: jest.Mock };

  beforeEach(async () => {
    createPH = mockService();
    findAllPH = mockService();
    findOnePH = mockService();
    updatePH = mockService();
    removePH = mockService();

    const module = await Test.createTestingModule({
      controllers: [ProductionHistoryController],
      providers: [
        { provide: CreateProductionHistoryService, useValue: createPH },
        { provide: FindAllProductionHistoriesService, useValue: findAllPH },
        { provide: FindOneProductionHistoryService, useValue: findOnePH },
        { provide: UpdateProductionHistoryService, useValue: updatePH },
        { provide: RemoveProductionHistoryService, useValue: removePH },
      ],
    }).compile();

    controller = module.get(ProductionHistoryController);
    jest.clearAllMocks();
  });

  it('should delegate create with dto and userId', async () => {
    const dto = { palletId: 'p-1', deliveredQuantity: 10 } as any;
    const userId = 'user-1';
    createPH.execute.mockResolvedValue({ id: '1' });
    expect(await controller.create(dto, userId)).toEqual({ id: '1' });
    expect(createPH.execute).toHaveBeenCalledWith(dto, userId);
  });

  it('should delegate findAll', async () => {
    findAllPH.execute.mockResolvedValue([]);
    expect(await controller.findAll()).toEqual([]);
  });

  it('should delegate findOne', async () => {
    findOnePH.execute.mockResolvedValue({ id: '1' });
    expect(await controller.findOne('1')).toEqual({ id: '1' });
  });

  it('should delegate update', async () => {
    const dto = { status: 'REFORMED' } as any;
    updatePH.execute.mockResolvedValue({ id: '1' });
    expect(await controller.update('1', dto)).toEqual({ id: '1' });
    expect(updatePH.execute).toHaveBeenCalledWith('1', dto);
  });

  it('should delegate remove', async () => {
    removePH.execute.mockResolvedValue(undefined);
    await controller.remove('1');
    expect(removePH.execute).toHaveBeenCalledWith('1');
  });
});
