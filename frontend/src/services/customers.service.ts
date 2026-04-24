import { api } from "@/lib/api";

export interface Customer {
  id: string;
  businessName: string;
  corporateName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  businessName: string;
  corporateName?: string;
}

export interface UpdateCustomerDto {
  businessName?: string;
  corporateName?: string;
}

export const customersService = {
  getAll: () => api.get<Customer[]>("/customers"),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (dto: CreateCustomerDto) => api.post<Customer>("/customers", dto),
  update: (id: string, dto: UpdateCustomerDto) => api.patch<Customer>(`/customers/${id}`, dto),
  remove: (id: string) => api.delete(`/customers/${id}`),
};
