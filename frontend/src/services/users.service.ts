import { api } from "@/lib/api";
import type { UserRole } from "./auth.service";

export interface User {
  id: string;
  name: string;
  login: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  login: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  login?: string;
  password?: string;
  role?: UserRole;
}

export const usersService = {
  getAll: () => api.get<User[]>("/users"),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (dto: CreateUserDto) => api.post<User>("/users", dto),
  update: (id: string, dto: UpdateUserDto) => api.patch<User>(`/users/${id}`, dto),
  remove: (id: string) => api.delete(`/users/${id}`),
};
