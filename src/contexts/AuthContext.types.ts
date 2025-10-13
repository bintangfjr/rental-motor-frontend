import type { Admin } from "../types/admin";

export interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setAuthData: (adminData: Admin, token: string, rememberMe?: boolean) => void;
}
