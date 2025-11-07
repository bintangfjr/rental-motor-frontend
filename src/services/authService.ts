// src/services/authService.ts
import axios, { AxiosError } from "axios";
import type { LoginResponse } from "../types/auth";
import type { Admin } from "../types/admin";

const API_URL = import.meta.env.VITE_API_URL || "http://157.66.35.108:3000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const handleAuthError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      defaultMessage;
    throw new Error(errorMessage);
  } else if (error instanceof Error) {
    throw error;
  } else {
    throw new Error(defaultMessage);
  }
};

// ✅ EKSPOR UTAMA - pastikan adminLogin tersedia
export const authService = {
  /**
   * Login untuk admin
   */
  adminLogin: async (
    username: string,
    password: string,
  ): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>("/admins/login", {
        username,
        password,
      });
      return response.data;
    } catch (error: unknown) {
      return handleAuthError(error, "Login gagal");
    }
  },

  /**
   * Login untuk user biasa
   */
  userLogin: async (
    email: string,
    password: string,
  ): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      return response.data;
    } catch (error: unknown) {
      return handleAuthError(error, "Login gagal");
    }
  },

  /**
   * Ambil token dari storage
   */
  getToken: (): string | null =>
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken"),

  /**
   * Ambil data admin dari storage
   */
  getCurrentAdminFromStorage: (): Admin | null => {
    const adminData =
      localStorage.getItem("admin") || sessionStorage.getItem("admin");
    return adminData ? JSON.parse(adminData) : null;
  },

  /**
   * Logout admin/user
   */
  logout: (): void => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("admin");
  },

  /**
   * Verifikasi token & ambil profil admin
   */
  verifyToken: async (): Promise<boolean> => {
    const token = authService.getToken();
    if (!token) return false;

    try {
      const response = await api.get<{ success: boolean }>("/admins/me");
      return response.data.success;
    } catch {
      return false;
    }
  },

  /**
   * Ganti password admin
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> => {
    try {
      await api.post("/admins/change-password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
    } catch (error: unknown) {
      return handleAuthError(error, "Gagal mengubah password");
    }
  },

  /**
   * Ambil profil admin
   */
  getProfile: async (): Promise<Admin> => {
    try {
      const response = await api.get<{ data: Admin }>("/admins/me");
      return response.data.data;
    } catch (error: unknown) {
      return handleAuthError(error, "Gagal mengambil profil");
    }
  },
};

// Interceptors
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default authService;
