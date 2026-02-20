import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class FindAllUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
    });

    return users.map((user) => new UserEntity(user));
  }
}
