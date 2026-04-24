import { api, setTokens, clearTokens } from "@/lib/api";

export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface AuthUser {
  id: string;
  name: string;
  document: string;
  role: UserRole;
}

interface LoginResponse {
  user: AuthUser;
  token: string;
  refresh: string;
}

export const authService = {
  async login(document: string, password: string): Promise<AuthUser> {
    const data = await api.post<LoginResponse>("/auth/login", {
      document,
      password,
    });
    setTokens(data.token, data.refresh);
    return data.user;
  },

  logout() {
    clearTokens();
  },
};
