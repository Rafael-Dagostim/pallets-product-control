import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../__mocks__/prisma.mock';
import { FindOneReportTemplateService } from './find-one-report-template.service';

describe('FindOneReportTemplateService', () => {
  let service: FindOneReportTemplateService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindOneReportTemplateService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindOneReportTemplateService);
    jest.clearAllMocks();
  });

  it('returns template when found', async () => {
    prisma.reportTemplate.findFirst.mockResolvedValue({ id: 't1' });
    const result = await service.execute('t1');
    expect(result.id).toBe('t1');
    expect(prisma.reportTemplate.findFirst).toHaveBeenCalledWith({
      where: { id: 't1', deletedAt: null },
    });
  });

  it('throws ObjectNotFoundException when missing', async () => {
    prisma.reportTemplate.findFirst.mockResolvedValue(null);
    await expect(service.execute('missing')).rejects.toThrow(
      ObjectNotFoundException,
    );
  });
});
