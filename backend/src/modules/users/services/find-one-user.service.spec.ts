import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { FindOneUserService } from './find-one-user.service';

describe('FindOneUserService', () => {
  let service: FindOneUserService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindOneUserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindOneUserService);
    jest.clearAllMocks();
  });

  it('should return user entity when found', async () => {
    const user = { id: 'u-1', name: 'A', login: 'AAA111', role: 'ADMIN', password: 'h', createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    prisma.user.findFirst.mockResolvedValue(user);

    const result = await service.execute('u-1');

    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { id: 'u-1', deletedAt: null } });
    expect(result.id).toBe('u-1');
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
