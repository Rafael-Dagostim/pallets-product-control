import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../__mocks__/prisma.mock';
import { RemoveReportTemplateService } from './remove-report-template.service';

describe('RemoveReportTemplateService', () => {
  let service: RemoveReportTemplateService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        RemoveReportTemplateService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(RemoveReportTemplateService);
    jest.clearAllMocks();
  });

  it('soft deletes template', async () => {
    prisma.reportTemplate.findFirst.mockResolvedValue({ id: 't1' });
    prisma.reportTemplate.update.mockResolvedValue({});

    await service.execute('t1');

    expect(prisma.reportTemplate.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('throws ObjectNotFoundException when missing', async () => {
    prisma.reportTemplate.findFirst.mockResolvedValue(null);
    await expect(service.execute('missing')).rejects.toThrow(
      ObjectNotFoundException,
    );
  });
});
