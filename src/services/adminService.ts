// src/services/adminService.ts
import axios, { AxiosResponse, AxiosError } from "axios";
import {
  Admin,
  CreateAdminData,
  UpdateAdminData,
  LoginAdminData,
  LoginAdminResponse,
} from "../types/admin";

// Gunakan environment variable atau default localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Tambahkan Authorization header otomatis jika token ada
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper untuk ekstrak data dengan aman
const getData = <T>(res: AxiosResponse<{ data: T }>): T => res.data.data;

// Helper untuk handle error dengan type safety
const handleError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error(
      defaultMessage,
      axiosError.response?.data || axiosError.message
    );
    throw new Error(
      axiosError.response?.data?.message || axiosError.message || defaultMessage
    );
  } else if (error instanceof Error) {
    console.error(defaultMessage, error.message);
    throw error;
  } else {
    console.error(defaultMessage, error);
    throw new Error(defaultMessage);
  }
};

// CRUD Admin Service
export const adminService = {
  login: async (data: LoginAdminData): Promise<LoginAdminResponse> => {
    try {
      const res = await api.post<{ data: LoginAdminResponse }>(
        "/admins/login",
        data
      );
      return getData(res);
    } catch (error: unknown) {
      return handleError(error, "Gagal login admin");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/admins/logout");
    } catch (error: unknown) {
      return handleError(error, "Gagal logout");
    }
  },

  getAll: async (): Promise<Admin[]> => {
    try {
      const res = await api.get<{ data: Admin[] }>("/admins");
      return getData(res);
    } catch (error: unknown) {
      return handleError(error, "Gagal mengambil semua admin");
    }
  },

  getAllWithTrashed: async (): Promise<Admin[]> => {
    try {
      const res = await api.get<{ data: Admin[] }>("/admins/with-trashed");
      return getData(res);
    } catch (error: unknown) {
      return handleError(
        error,
        "Gagal mengambil semua admin (termasuk terhapus)"
      );
    }
  },

  getById: async (id: number): Promise<Admin> => {
    try {
      const res = await api.get<{ data: Admin }>(`/admins/${id}`);
      return getData(res);
    } catch (error: unknown) {
      return handleError(error, `Gagal mengambil admin dengan ID ${id}`);
    }
  },

  create: async (data: CreateAdminData): Promise<Admin> => {
    try {
      console.log("Mengirim payload create:", data);
      const res = await api.post<{ data: Admin }>("/admins", data);
      return getData(res);
    } catch (error: unknown) {
      return handleError(error, "Gagal membuat admin");
    }
  },

  update: async (id: number, data: UpdateAdminData): Promise<Admin> => {
    try {
      console.log(`Mengirim payload update ID ${id}:`, data);
      const res = await api.put<{ data: Admin }>(`/admins/${id}`, data);
      return getData(res);
    } catch (error: unknown) {
      return handleError(error, `Gagal mengupdate admin ID ${id}`);
    }
  },

  softDelete: async (id: number): Promise<Admin> => {
    try {
      const res = await api.delete<{ data: Admin }>(`/admins/${id}`);
      return getData(res);
    } catch (error: unknown) {
      return handleError(error, `Gagal menghapus admin ID ${id}`);
    }
  },

  restore: async (id: number): Promise<Admin> => {
    try {
      const res = await api.post<{ data: Admin }>(`/admins/${id}/restore`);
      return getData(res);
    } catch (error: unknown) {
      return handleError(error, `Gagal merestore admin ID ${id}`);
    }
  },

  forceDelete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/admins/${id}/force`);
    } catch (error: unknown) {
      return handleError(error, `Gagal force delete admin ID ${id}`);
    }
  },
};
