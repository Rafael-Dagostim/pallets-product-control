import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@core/database/database.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class CreateUserService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateUserDto): Promise<UserEntity> {
    const salt = await bcrypt.genSalt();
    const pepper = process.env.PWD_PEPPER || '';
    const password = await bcrypt.hash(dto.password + pepper, salt);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password,
        salt,
      },
    });

    return new UserEntity(user);
  }
}
