import { Test } from '@nestjs/testing';
import { OrderItemsController } from './order-items.controller';
import {
  CreateOrderItemService,
  FindAllOrderItemsService,
  FindOneOrderItemService,
  UpdateOrderItemService,
  RemoveOrderItemService,
} from './services';

describe('OrderItemsController', () => {
  let controller: OrderItemsController;
  const mockService = () => ({ execute: jest.fn() });

  let createOrderItem: { execute: jest.Mock };
  let findAllOrderItems: { execute: jest.Mock };
  let findOneOrderItem: { execute: jest.Mock };
  let updateOrderItem: { execute: jest.Mock };
  let removeOrderItem: { execute: jest.Mock };

  beforeEach(async () => {
    createOrderItem = mockService();
    findAllOrderItems = mockService();
    findOneOrderItem = mockService();
    updateOrderItem = mockService();
    removeOrderItem = mockService();

    const module = await Test.createTestingModule({
      controllers: [OrderItemsController],
      providers: [
        { provide: CreateOrderItemService, useValue: createOrderItem },
        { provide: FindAllOrderItemsService, useValue: findAllOrderItems },
        { provide: FindOneOrderItemService, useValue: findOneOrderItem },
        { provide: UpdateOrderItemService, useValue: updateOrderItem },
        { provide: RemoveOrderItemService, useValue: removeOrderItem },
      ],
    }).compile();

    controller = module.get(OrderItemsController);
    jest.clearAllMocks();
  });

  it('should delegate create', async () => {
    const dto = { orderId: 'o-1', palletId: 'p-1', quantityRequested: 100 } as any;
    createOrderItem.execute.mockResolvedValue({ id: '1' });
    expect(await controller.create(dto)).toEqual({ id: '1' });
    expect(createOrderItem.execute).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll', async () => {
    findAllOrderItems.execute.mockResolvedValue([]);
    expect(await controller.findAll()).toEqual([]);
  });

  it('should delegate findOne', async () => {
    findOneOrderItem.execute.mockResolvedValue({ id: '1' });
    expect(await controller.findOne('1')).toEqual({ id: '1' });
  });

  it('should delegate update', async () => {
    const dto = { quantityRequested: 200 } as any;
    updateOrderItem.execute.mockResolvedValue({ id: '1' });
    expect(await controller.update('1', dto)).toEqual({ id: '1' });
    expect(updateOrderItem.execute).toHaveBeenCalledWith('1', dto);
  });

  it('should delegate remove', async () => {
    removeOrderItem.execute.mockResolvedValue(undefined);
    await controller.remove('1');
    expect(removeOrderItem.execute).toHaveBeenCalledWith('1');
  });
});
