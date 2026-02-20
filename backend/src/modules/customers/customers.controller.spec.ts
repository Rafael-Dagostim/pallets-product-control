import { Test } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import {
  CreateCustomerService,
  FindAllCustomersService,
  FindOneCustomerService,
  UpdateCustomerService,
  RemoveCustomerService,
} from './services';

describe('CustomersController', () => {
  let controller: CustomersController;
  const mockService = () => ({ execute: jest.fn() });

  let createCustomer: { execute: jest.Mock };
  let findAllCustomers: { execute: jest.Mock };
  let findOneCustomer: { execute: jest.Mock };
  let updateCustomer: { execute: jest.Mock };
  let removeCustomer: { execute: jest.Mock };

  beforeEach(async () => {
    createCustomer = mockService();
    findAllCustomers = mockService();
    findOneCustomer = mockService();
    updateCustomer = mockService();
    removeCustomer = mockService();

    const module = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CreateCustomerService, useValue: createCustomer },
        { provide: FindAllCustomersService, useValue: findAllCustomers },
        { provide: FindOneCustomerService, useValue: findOneCustomer },
        { provide: UpdateCustomerService, useValue: updateCustomer },
        { provide: RemoveCustomerService, useValue: removeCustomer },
      ],
    }).compile();

    controller = module.get(CustomersController);
    jest.clearAllMocks();
  });

  it('should delegate create', async () => {
    const dto = { businessName: 'Test' } as any;
    createCustomer.execute.mockResolvedValue({ id: '1' });
    const result = await controller.create(dto);
    expect(createCustomer.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: '1' });
  });

  it('should delegate findAll', async () => {
    findAllCustomers.execute.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(findAllCustomers.execute).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should delegate findOne', async () => {
    findOneCustomer.execute.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1');
    expect(findOneCustomer.execute).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });

  it('should delegate update', async () => {
    const dto = { businessName: 'Updated' } as any;
    updateCustomer.execute.mockResolvedValue({ id: '1' });
    const result = await controller.update('1', dto);
    expect(updateCustomer.execute).toHaveBeenCalledWith('1', dto);
    expect(result).toEqual({ id: '1' });
  });

  it('should delegate remove', async () => {
    removeCustomer.execute.mockResolvedValue(undefined);
    await controller.remove('1');
    expect(removeCustomer.execute).toHaveBeenCalledWith('1');
  });
});
