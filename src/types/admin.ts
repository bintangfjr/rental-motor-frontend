// src/types/admin.ts

export { Admin, LoginRequest, ChangePasswordData } from "./auth";

/** -------------------------------
 * Tipe data admin dari backend
 * -------------------------------
 */
export interface Admin {
  id: number;
  nama_lengkap: string;
  username: string;
  email: string;
  is_super_admin: boolean;
  role?: "admin" | "super_admin"; // Jadikan optional untuk kompatibilitas
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
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
/** -------------------------------
 * Data untuk membuat admin baru
 * -------------------------------
 */
export interface CreateAdminData {
  nama_lengkap: string;
  username: string;
  email: string;
  password: string;
  password_confirmation?: string;
  is_super_admin?: boolean;
}

/** -------------------------------
 * Data untuk update admin
 * -------------------------------
 */
export interface UpdateAdminData {
  nama_lengkap?: string;
  username?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  is_super_admin?: boolean;
}

/** -------------------------------
 * Data login admin
 * -------------------------------
 */
export interface LoginAdminData {
  username: string;
  password: string;
}

/** -------------------------------
 * Response login admin
 * -------------------------------
 */
export interface LoginAdminResponse {
  success: boolean;
  message?: string;
  data: {
    access_token: string;
    admin: Admin;
  };
}
