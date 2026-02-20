import { Test } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import {
  CreateOrderService,
  FindAllOrdersService,
  FindOneOrderService,
  UpdateOrderService,
  RemoveOrderService,
} from './services';

describe('OrdersController', () => {
  let controller: OrdersController;
  const mockService = () => ({ execute: jest.fn() });

  let createOrder: { execute: jest.Mock };
  let findAllOrders: { execute: jest.Mock };
  let findOneOrder: { execute: jest.Mock };
  let updateOrder: { execute: jest.Mock };
  let removeOrder: { execute: jest.Mock };

  beforeEach(async () => {
    createOrder = mockService();
    findAllOrders = mockService();
    findOneOrder = mockService();
    updateOrder = mockService();
    removeOrder = mockService();

    const module = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: CreateOrderService, useValue: createOrder },
        { provide: FindAllOrdersService, useValue: findAllOrders },
        { provide: FindOneOrderService, useValue: findOneOrder },
        { provide: UpdateOrderService, useValue: updateOrder },
        { provide: RemoveOrderService, useValue: removeOrder },
      ],
    }).compile();

    controller = module.get(OrdersController);
    jest.clearAllMocks();
  });

  it('should delegate create', async () => {
    const dto = { customerId: '1' } as any;
    createOrder.execute.mockResolvedValue({ id: '1' });
    expect(await controller.create(dto)).toEqual({ id: '1' });
    expect(createOrder.execute).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll', async () => {
    findAllOrders.execute.mockResolvedValue([]);
    expect(await controller.findAll()).toEqual([]);
  });

  it('should delegate findOne', async () => {
    findOneOrder.execute.mockResolvedValue({ id: '1' });
    expect(await controller.findOne('1')).toEqual({ id: '1' });
  });

  it('should delegate update', async () => {
    const dto = { status: 'DONE' } as any;
    updateOrder.execute.mockResolvedValue({ id: '1' });
    expect(await controller.update('1', dto)).toEqual({ id: '1' });
    expect(updateOrder.execute).toHaveBeenCalledWith('1', dto);
  });

  it('should delegate remove', async () => {
    removeOrder.execute.mockResolvedValue(undefined);
    await controller.remove('1');
    expect(removeOrder.execute).toHaveBeenCalledWith('1');
  });
});
