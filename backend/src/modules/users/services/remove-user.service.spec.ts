import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import { createMockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.mock';
import { RemoveUserService } from './remove-user.service';

describe('RemoveUserService', () => {
  let service: RemoveUserService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        RemoveUserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(RemoveUserService);
    jest.clearAllMocks();
  });

  it('should soft delete user', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u-1' });
    prisma.user.update.mockResolvedValue({});

    await service.execute('u-1');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should throw ObjectNotFoundException when not found', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.execute('not-found')).rejects.toThrow(ObjectNotFoundException);
  });
});
