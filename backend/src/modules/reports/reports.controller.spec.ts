import { Test } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import {
  CreateReportTemplateService,
  FindAllReportTemplatesService,
  FindOneReportTemplateService,
  GetReportSummaryService,
  RemoveReportTemplateService,
  UpdateReportTemplateService,
} from './services';

describe('ReportsController', () => {
  let controller: ReportsController;
  const mock = () => ({ execute: jest.fn() });

  let summary: { execute: jest.Mock };
  let create: { execute: jest.Mock };
  let findAll: { execute: jest.Mock };
  let findOne: { execute: jest.Mock };
  let update: { execute: jest.Mock };
  let remove: { execute: jest.Mock };

  beforeEach(async () => {
    summary = mock();
    create = mock();
    findAll = mock();
    findOne = mock();
    update = mock();
    remove = mock();

    const module = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: GetReportSummaryService, useValue: summary },
        { provide: CreateReportTemplateService, useValue: create },
        { provide: FindAllReportTemplatesService, useValue: findAll },
        { provide: FindOneReportTemplateService, useValue: findOne },
        { provide: UpdateReportTemplateService, useValue: update },
        { provide: RemoveReportTemplateService, useValue: remove },
      ],
    }).compile();

    controller = module.get(ReportsController);
    jest.clearAllMocks();
  });

  it('delegates summary to service', () => {
    const filters = { from: '2026-04-01', to: '2026-04-30' };
    controller.summary(filters);
    expect(summary.execute).toHaveBeenCalledWith(filters);
  });

  it('creates template with userId', () => {
    const dto = { name: 'A', widgets: [{ type: 'kpi' as const }] };
    controller.createTemplate(dto, 'user-1');
    expect(create.execute).toHaveBeenCalledWith(dto, 'user-1');
  });

  it('delegates listTemplates', () => {
    controller.listTemplates();
    expect(findAll.execute).toHaveBeenCalled();
  });

  it('delegates findTemplate/updateTemplate/removeTemplate', () => {
    controller.findTemplate('id-1');
    controller.updateTemplate('id-1', { name: 'x' });
    controller.removeTemplate('id-1');
    expect(findOne.execute).toHaveBeenCalledWith('id-1');
    expect(update.execute).toHaveBeenCalledWith('id-1', { name: 'x' });
    expect(remove.execute).toHaveBeenCalledWith('id-1');
  });
});
