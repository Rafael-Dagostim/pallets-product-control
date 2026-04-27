import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../__mocks__/prisma.mock';
import { CreateReportTemplateService } from './create-report-template.service';

describe('CreateReportTemplateService', () => {
  let service: CreateReportTemplateService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        CreateReportTemplateService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CreateReportTemplateService);
    jest.clearAllMocks();
  });

  it('creates template when name is unique', async () => {
    prisma.reportTemplate.findFirst.mockResolvedValue(null);
    prisma.reportTemplate.create.mockResolvedValue({ id: 't1', name: 'A' });

    const result = await service.execute(
      { name: 'A', widgets: [{ type: 'kpi' }] },
      'user-1',
    );

    expect(prisma.reportTemplate.create).toHaveBeenCalledWith({
      data: { name: 'A', widgets: [{ type: 'kpi' }], createdById: 'user-1' },
    });
    expect(result.id).toBe('t1');
  });

  it('throws ConflictException when name already exists', async () => {
    prisma.reportTemplate.findFirst.mockResolvedValue({ id: 'other' });

    await expect(
      service.execute({ name: 'A', widgets: [{ type: 'kpi' }] }, 'user-1'),
    ).rejects.toThrow(ConflictException);
  });
});
