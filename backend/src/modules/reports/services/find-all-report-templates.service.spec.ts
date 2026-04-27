import { Test } from '@nestjs/testing';
import { PrismaService } from '@core/database/database.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../__mocks__/prisma.mock';
import { FindAllReportTemplatesService } from './find-all-report-templates.service';

describe('FindAllReportTemplatesService', () => {
  let service: FindAllReportTemplatesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        FindAllReportTemplatesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindAllReportTemplatesService);
    jest.clearAllMocks();
  });

  it('returns non-deleted templates ordered by createdAt', async () => {
    prisma.reportTemplate.findMany.mockResolvedValue([{ id: 't1' }]);
    const result = await service.execute();

    expect(prisma.reportTemplate.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    expect(result).toHaveLength(1);
  });
});
