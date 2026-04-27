import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '@core/database/database.service';
import { ObjectNotFoundException } from '@shared/exceptions/object-not-found.exception';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../__mocks__/prisma.mock';
import { UpdateReportTemplateService } from './update-report-template.service';

describe('UpdateReportTemplateService', () => {
  let service: UpdateReportTemplateService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        UpdateReportTemplateService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UpdateReportTemplateService);
    jest.clearAllMocks();
  });

  it('updates fields when found and name unique', async () => {
    prisma.reportTemplate.findFirst
      .mockResolvedValueOnce({ id: 't1', name: 'Old' })
      .mockResolvedValueOnce(null);
    prisma.reportTemplate.update.mockResolvedValue({ id: 't1', name: 'New' });

    const result = await service.execute('t1', {
      name: 'New',
      widgets: [{ type: 'kpi' }],
    });

    expect(prisma.reportTemplate.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { name: 'New', widgets: [{ type: 'kpi' }] },
    });
    expect(result.name).toBe('New');
  });

  it('throws ObjectNotFoundException when template missing', async () => {
    prisma.reportTemplate.findFirst.mockResolvedValue(null);
    await expect(
      service.execute('missing', { name: 'X' }),
    ).rejects.toThrow(ObjectNotFoundException);
  });

  it('throws ConflictException when new name already taken', async () => {
    prisma.reportTemplate.findFirst
      .mockResolvedValueOnce({ id: 't1', name: 'Old' })
      .mockResolvedValueOnce({ id: 'other' });

    await expect(service.execute('t1', { name: 'Other' })).rejects.toThrow(
      ConflictException,
    );
  });
});
