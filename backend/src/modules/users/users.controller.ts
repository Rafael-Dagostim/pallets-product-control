import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@generated/prisma';
import { Roles } from '@shared/decorators';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CreateUserService,
  FindAllUsersService,
  FindOneUserService,
  UpdateUserService,
  RemoveUserService,
} from './services';

@Controller('users')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(
    private readonly createUser: CreateUserService,
    private readonly findAllUsers: FindAllUsersService,
    private readonly findOneUser: FindOneUserService,
    private readonly updateUser: UpdateUserService,
    private readonly removeUser: RemoveUserService,
  ) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.createUser.execute(dto);
  }

  @Get()
  findAll() {
    return this.findAllUsers.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findOneUser.execute(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.updateUser.execute(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.removeUser.execute(id);
  }
}
