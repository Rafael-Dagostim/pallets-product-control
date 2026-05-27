import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindAllUsersService } from './find-all-users.service';

describe('FindAllUsersService', () => {
  let service: FindAllUsersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindAllUsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindAllUsersService);
    jest.clearAllMocks();
  });

  it('should return array of user entities filtering soft deletes', async () => {
    const users = [
      { id: 'u-1', name: 'A', login: 'AAA111', role: 'ADMIN', password: 'h', createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    ];
    prisma.user.findMany.mockResolvedValue(users);

    const result = await service.execute();

    expect(prisma.user.findMany).toHaveBeenCalledWith({ where: { deletedAt: null } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('u-1');
  });
});
