import { api, setTokens, clearTokens } from "@/lib/api";

export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface AuthUser {
  id: string;
  name: string;
  login: string;
  role: UserRole;
}

interface LoginResponse {
  user: AuthUser;
  token: string;
  refresh: string;
}

export const authService = {
  async login(loginId: string, password: string): Promise<AuthUser> {
    const data = await api.post<LoginResponse>("/auth/login", {
      login: loginId,
      password,
    });
    setTokens(data.token, data.refresh);
    return data.user;
  },

  logout() {
    clearTokens();
  },
};
