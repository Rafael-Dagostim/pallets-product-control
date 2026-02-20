import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class FindOneUserService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new ObjectNotFoundException('Usuário', 'id', id);
    }

    return new UserEntity(user);
  }
}
