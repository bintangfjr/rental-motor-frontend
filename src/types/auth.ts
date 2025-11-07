// types/auth.ts
export interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
  nama_lengkap: string;
  is_super_admin: boolean;
  role?: string; // Opsional, tambahkan jika backend mengirimkan role
  created_at: string;
  updated_at: string;
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
