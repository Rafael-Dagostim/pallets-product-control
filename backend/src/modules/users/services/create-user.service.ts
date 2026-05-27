import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@core/database/database.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class CreateUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserEntity> {
    const pepper = this.configService.get<string>('PWD_PEPPER', '');
    // bcrypt generates and embeds its own salt in the resulting hash.
    const password = await bcrypt.hash(dto.password + pepper, 10);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password,
      },
    });

    return new UserEntity(user);
  }
}
