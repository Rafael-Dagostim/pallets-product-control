import { api } from "@/lib/api";
import type { Customer } from "./customers.service";

export type OrderStatus = "OPEN" | "IN_PRODUCTION" | "DONE" | "CANCELED";

export interface OrderItem {
  id: string;
  palletId: string;
  quantityRequested: number;
  quantityProduced: number;
  pallet?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  deadline: string;
  customer?: Customer;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDto {
  palletId: string;
  quantityRequested: number;
}

export interface CreateOrderDto {
  customerId: string;
  deadline: string;
  items: CreateOrderItemDto[];
}

export interface UpdateOrderDto {
  customerId?: string;
  deadline?: string;
  status?: OrderStatus;
}

export const ordersService = {
  getAll: () => api.get<Order[]>("/orders"),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  create: (dto: CreateOrderDto) => api.post<Order>("/orders", dto),
  update: (id: string, dto: UpdateOrderDto) => api.patch<Order>(`/orders/${id}`, dto),
  remove: (id: string) => api.delete(`/orders/${id}`),
};
