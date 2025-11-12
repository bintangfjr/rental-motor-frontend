// types/auth.ts

// Interface untuk Admin - gunakan satu sumber kebenaran
export interface Admin {
  id: number;
  username: string;
  email: string;
  nama_lengkap: string;
  is_super_admin: boolean;
  role?: "admin" | "super_admin"; // Explicit enum untuk type safety
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

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
  changePassword?: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  hasPermission?: (permission: string) => boolean;
  isSuperAdmin?: () => boolean;
  isAdmin?: () => boolean;
}

// ✅ PERBAIKAN: Interface yang komprehensif untuk response login
export interface LoginResponse {
  success: boolean;
  message?: string;
  // Format 1: data object (nesting)
  data?: {
    access_token: string;
    admin: Admin;
  };
  // Format 2: flat structure
  access_token?: string;
  admin?: Admin;
  // Format 3: NestJS common format
  statusCode?: number;
}

// Interface untuk error response
export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  error?: string;
}

// Interface untuk change password
export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// Interface untuk login request
export interface LoginRequest {
  username: string;
  password: string;
}

// Helper type untuk normalize response login
export type NormalizedLoginResponse = {
  access_token: string;
  admin: Admin;
};

// Utility function untuk normalize response
export const normalizeLoginResponse = (
  response: LoginResponse
): NormalizedLoginResponse => {
  // Jika data ada di nested object
  if (response.data && response.data.access_token && response.data.admin) {
    return {
      access_token: response.data.access_token,
      admin: response.data.admin,
    };
  }

  // Jika data flat
  if (response.access_token && response.admin) {
    return {
      access_token: response.access_token,
      admin: response.admin,
    };
  }

  throw new Error("Invalid login response format");
};

// Utility function untuk normalize admin data
export const normalizeAdminData = (adminData: any): Admin => {
  return {
    id: adminData.id,
    username: adminData.username,
    email: adminData.email,
    nama_lengkap: adminData.nama_lengkap,
    is_super_admin: adminData.is_super_admin,
    role: adminData.is_super_admin ? "super_admin" : "admin",
    created_at: adminData.created_at,
    updated_at: adminData.updated_at,
    deleted_at: adminData.deleted_at,
  };
};

// Type guards untuk validasi response
export const isLoginResponse = (data: any): data is LoginResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.success === "boolean" &&
    (data.data !== undefined ||
      data.access_token !== undefined ||
      data.admin !== undefined)
  );
};

export const isValidAdmin = (data: any): data is Admin => {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.id === "number" &&
    typeof data.username === "string" &&
    typeof data.email === "string" &&
    typeof data.nama_lengkap === "string" &&
    typeof data.is_super_admin === "boolean"
  );
};
