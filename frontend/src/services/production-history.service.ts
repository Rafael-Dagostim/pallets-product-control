import { api } from "@/lib/api";

export type ProductionStatus = "OPEN" | "VERIFIED" | "CANCELED" | "PAID";

export interface ProductionHistory {
  id: string;
  userId: string;
  palletId: string;
  deliveredQuantity: number;
  reformedQuantity: number;
  status: ProductionStatus;
  observation: string | null;
  user?: {
    id: string;
    name: string;
  };
  pallet?: {
    id: string;
    name: string;
    version: number;
    productionCost: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductionHistoryDto {
  userId: string;
  palletId: string;
  deliveredQuantity: number;
}

export interface UpdateProductionHistoryDto {
  status?: ProductionStatus;
  reformedQuantity?: number;
  observation?: string;
}

export interface ProductionHistoryFilters {
  date?: string;
  from?: string;
  to?: string;
  userId?: string;
  status?: ProductionStatus;
}

function buildQuery(filters?: ProductionHistoryFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const productionHistoryService = {
  getAll: (filters?: ProductionHistoryFilters | string) => {
    const query =
      typeof filters === "string"
        ? filters
          ? `?date=${filters}`
          : ""
        : buildQuery(filters);
    return api.get<ProductionHistory[]>(`/production-history${query}`);
  },
  getById: (id: string) =>
    api.get<ProductionHistory>(`/production-history/${id}`),
  create: (dto: CreateProductionHistoryDto) =>
    api.post<ProductionHistory>("/production-history", dto),
  update: (id: string, dto: UpdateProductionHistoryDto) =>
    api.patch<ProductionHistory>(`/production-history/${id}`, dto),
  remove: (id: string) => api.delete(`/production-history/${id}`),
  bulkPay: (ids: string[]) =>
    api.post<ProductionHistory[]>("/production-history/bulk-pay", { ids }),
};
