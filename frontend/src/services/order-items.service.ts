import { api } from "@/lib/api";

export interface OrderItemFull {
  id: string;
  orderId: string;
  palletId: string;
  quantityRequested: number;
  quantityProduced: number;
  pallet?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDto {
  orderId: string;
  palletId: string;
  quantityRequested: number;
}

export interface UpdateOrderItemDto {
  orderId?: string;
  palletId?: string;
  quantityRequested?: number;
  quantityProduced?: number;
}

export const orderItemsService = {
  getAll: () => api.get<OrderItemFull[]>("/order-items"),
  getById: (id: string) => api.get<OrderItemFull>(`/order-items/${id}`),
  create: (dto: CreateOrderItemDto) => api.post<OrderItemFull>("/order-items", dto),
  update: (id: string, dto: UpdateOrderItemDto) => api.patch<OrderItemFull>(`/order-items/${id}`, dto),
  remove: (id: string) => api.delete(`/order-items/${id}`),
};
