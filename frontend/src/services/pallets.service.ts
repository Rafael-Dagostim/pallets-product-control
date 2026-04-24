import { api } from "@/lib/api";

export interface Pallet {
  id: string;
  name: string;
  version: number;
  versionFromId: string | null;
  buyCost: number;
  productionCost: number;
  sellPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePalletDto {
  name: string;
  buyCost: number;
  productionCost: number;
  sellPrice: number;
  versionFromId?: string;
}

export interface UpdatePalletDto {
  name?: string;
  buyCost?: number;
  productionCost?: number;
  sellPrice?: number;
}

export const palletsService = {
  getAll: () => api.get<Pallet[]>("/pallets"),
  getById: (id: string) => api.get<Pallet>(`/pallets/${id}`),
  create: (dto: CreatePalletDto) => api.post<Pallet>("/pallets", dto),
  update: (id: string, dto: UpdatePalletDto) => api.patch<Pallet>(`/pallets/${id}`, dto),
  remove: (id: string) => api.delete(`/pallets/${id}`),
};
