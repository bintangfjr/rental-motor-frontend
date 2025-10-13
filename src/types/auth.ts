// types/auth.ts
import { Admin } from "./admin";

export interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (
    username: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setAuthData: (adminData: Admin, token: string, rememberMe?: boolean) => void;
}
// ✅ PERBAIKAN: Sesuaikan dengan LoginAdminResponse
export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    access_token: string;
    admin: Admin;
  };
  access_token?: string;
  admin?: Admin;
}
