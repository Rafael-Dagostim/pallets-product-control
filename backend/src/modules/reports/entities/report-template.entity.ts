import { Prisma, ReportTemplate } from '@generated/prisma';

export interface WidgetConfig {
  type:
    | 'kpi'
    | 'palletBar'
    | 'userBar'
    | 'timeline'
    | 'orderDonut'
    | 'detailTable';
}

export class ReportTemplateEntity implements ReportTemplate {
  id: string;
  name: string;
  widgets: Prisma.JsonValue;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(partial: Partial<ReportTemplateEntity>) {
    Object.assign(this, partial);
  }
}
