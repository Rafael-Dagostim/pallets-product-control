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

export const productionHistoryService = {
  getAll: (date?: string) =>
    api.get<ProductionHistory[]>(
      `/production-history${date ? `?date=${date}` : ""}`,
    ),
  getById: (id: string) => api.get<ProductionHistory>(`/production-history/${id}`),
  create: (dto: CreateProductionHistoryDto) =>
    api.post<ProductionHistory>("/production-history", dto),
  update: (id: string, dto: UpdateProductionHistoryDto) =>
    api.patch<ProductionHistory>(`/production-history/${id}`, dto),
  remove: (id: string) => api.delete(`/production-history/${id}`),
};
