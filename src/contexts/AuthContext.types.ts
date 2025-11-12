// contexts/AuthContext.types.ts
export interface Admin {
  id: number;
  nama_lengkap: string;
  username: string;
  email: string;
  is_super_admin: boolean;
  role: "admin" | "super_admin";
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (loginData: LoginData, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  changePassword: (passwordData: ChangePasswordData) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearAuth: () => void;
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
}
