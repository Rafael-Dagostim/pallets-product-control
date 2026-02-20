import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import {
  CreateUserService,
  FindAllUsersService,
  FindOneUserService,
  UpdateUserService,
  RemoveUserService,
} from './services';

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserService,
    FindAllUsersService,
    FindOneUserService,
    UpdateUserService,
    RemoveUserService,
  ],
  exports: [
    FindOneUserService,
  ],
})
export class UsersModule {}
