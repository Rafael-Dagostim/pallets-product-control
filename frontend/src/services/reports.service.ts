import { api } from "@/lib/api";

export type WidgetType =
  | "kpi"
  | "palletBar"
  | "userBar"
  | "timeline"
  | "orderDonut"
  | "detailTable";

export interface WidgetConfig {
  type: WidgetType;
}

export interface ReportTemplate {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilters {
  from: string;
  to: string;
  userId?: string;
  palletId?: string;
}

export type OrderStatusKey = "OPEN" | "IN_PRODUCTION" | "DONE" | "CANCELED";
export type ProductionStatusKey = "OPEN" | "VERIFIED" | "CANCELED" | "PAID";

export interface ReportSummary {
  kpis: {
    ordersDelivered: number;
    palletsProduced: number;
    salesTotalBRL: number;
    reformCostBRL: number;
    activeCollaborators: number;
  };
  palletBar: { palletId: string; name: string; version: number; qty: number }[];
  userBar: { userId: string; name: string; qty: number; payableBRL: number }[];
  timeline: {
    date: string;
    produced: number;
    delivered: number;
    reformed: number;
  }[];
  orderDonut: { status: OrderStatusKey; count: number }[];
  detailTable: {
    id: string;
    createdAt: string;
    userName: string;
    palletName: string;
    palletVersion: number;
    deliveredQuantity: number;
    reformedQuantity: number;
    status: ProductionStatusKey;
    payableBRL: number;
  }[];
}

function buildQuery(filters: ReportFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
  });
  return params.toString() ? `?${params.toString()}` : "";
}

export const reportsService = {
  getSummary: (filters: ReportFilters) =>
    api.get<ReportSummary>(`/reports/summary${buildQuery(filters)}`),
  listTemplates: () => api.get<ReportTemplate[]>("/reports/templates"),
  createTemplate: (dto: { name: string; widgets: WidgetConfig[] }) =>
    api.post<ReportTemplate>("/reports/templates", dto),
  updateTemplate: (
    id: string,
    dto: Partial<{ name: string; widgets: WidgetConfig[] }>,
  ) => api.patch<ReportTemplate>(`/reports/templates/${id}`, dto),
  removeTemplate: (id: string) => api.delete(`/reports/templates/${id}`),
};
