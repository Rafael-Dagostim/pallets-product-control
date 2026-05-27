import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UpdateUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const existing = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new ObjectNotFoundException('Usuário', 'id', id);
    }

    const data: Record<string, unknown> = { ...dto };

    if (dto.password) {
      const pepper = this.configService.get<string>('PWD_PEPPER', '');
      // bcrypt generates and embeds its own salt in the resulting hash.
      data.password = await bcrypt.hash(dto.password + pepper, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    return new UserEntity(user);
  }
}
