import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import {
  CreateUserService,
  FindAllUsersService,
  FindOneUserService,
  UpdateUserService,
  RemoveUserService,
} from './services';

describe('UsersController', () => {
  let controller: UsersController;
  const mockService = () => ({ execute: jest.fn() });

  let createUser: { execute: jest.Mock };
  let findAllUsers: { execute: jest.Mock };
  let findOneUser: { execute: jest.Mock };
  let updateUser: { execute: jest.Mock };
  let removeUser: { execute: jest.Mock };

  beforeEach(async () => {
    createUser = mockService();
    findAllUsers = mockService();
    findOneUser = mockService();
    updateUser = mockService();
    removeUser = mockService();

    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CreateUserService, useValue: createUser },
        { provide: FindAllUsersService, useValue: findAllUsers },
        { provide: FindOneUserService, useValue: findOneUser },
        { provide: UpdateUserService, useValue: updateUser },
        { provide: RemoveUserService, useValue: removeUser },
      ],
    }).compile();

    controller = module.get(UsersController);
    jest.clearAllMocks();
  });

  it('should delegate create', async () => {
    const dto = { name: 'Test' } as any;
    createUser.execute.mockResolvedValue({ id: '1' });
    expect(await controller.create(dto)).toEqual({ id: '1' });
    expect(createUser.execute).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll', async () => {
    findAllUsers.execute.mockResolvedValue([]);
    expect(await controller.findAll()).toEqual([]);
  });

  it('should delegate findOne', async () => {
    findOneUser.execute.mockResolvedValue({ id: '1' });
    expect(await controller.findOne('1')).toEqual({ id: '1' });
    expect(findOneUser.execute).toHaveBeenCalledWith('1');
  });

  it('should delegate update', async () => {
    const dto = { name: 'Updated' } as any;
    updateUser.execute.mockResolvedValue({ id: '1' });
    expect(await controller.update('1', dto)).toEqual({ id: '1' });
    expect(updateUser.execute).toHaveBeenCalledWith('1', dto);
  });

  it('should delegate remove', async () => {
    removeUser.execute.mockResolvedValue(undefined);
    await controller.remove('1');
    expect(removeUser.execute).toHaveBeenCalledWith('1');
  });
});
