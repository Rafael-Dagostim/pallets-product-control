import { Test } from '@nestjs/testing';
import { PalletsController } from './pallets.controller';
import {
  CreatePalletService,
  FindAllPalletsService,
  FindOnePalletService,
  UpdatePalletService,
  RemovePalletService,
} from './services';

describe('PalletsController', () => {
  let controller: PalletsController;
  const mockService = () => ({ execute: jest.fn() });

  let createPallet: { execute: jest.Mock };
  let findAllPallets: { execute: jest.Mock };
  let findOnePallet: { execute: jest.Mock };
  let updatePallet: { execute: jest.Mock };
  let removePallet: { execute: jest.Mock };

  beforeEach(async () => {
    createPallet = mockService();
    findAllPallets = mockService();
    findOnePallet = mockService();
    updatePallet = mockService();
    removePallet = mockService();

    const module = await Test.createTestingModule({
      controllers: [PalletsController],
      providers: [
        { provide: CreatePalletService, useValue: createPallet },
        { provide: FindAllPalletsService, useValue: findAllPallets },
        { provide: FindOnePalletService, useValue: findOnePallet },
        { provide: UpdatePalletService, useValue: updatePallet },
        { provide: RemovePalletService, useValue: removePallet },
      ],
    }).compile();

    controller = module.get(PalletsController);
    jest.clearAllMocks();
  });

  it('should delegate create', async () => {
    const dto = { name: 'P' } as any;
    createPallet.execute.mockResolvedValue({ id: '1' });
    expect(await controller.create(dto)).toEqual({ id: '1' });
    expect(createPallet.execute).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll', async () => {
    findAllPallets.execute.mockResolvedValue([]);
    expect(await controller.findAll()).toEqual([]);
  });

  it('should delegate findOne', async () => {
    findOnePallet.execute.mockResolvedValue({ id: '1' });
    expect(await controller.findOne('1')).toEqual({ id: '1' });
  });

  it('should delegate update', async () => {
    const dto = { name: 'Updated' } as any;
    updatePallet.execute.mockResolvedValue({ id: '1' });
    expect(await controller.update('1', dto)).toEqual({ id: '1' });
    expect(updatePallet.execute).toHaveBeenCalledWith('1', dto);
  });

  it('should delegate remove', async () => {
    removePallet.execute.mockResolvedValue(undefined);
    await controller.remove('1');
    expect(removePallet.execute).toHaveBeenCalledWith('1');
  });
});
