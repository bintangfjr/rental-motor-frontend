import api from "./api";
import {
  Sewa,
  CreateSewaData,
  UpdateSewaData,
  SelesaiSewaData,
} from "../types/sewa";

// Interface untuk response selesai sewa
export interface SelesaiSewaResponse {
  sewa: Sewa;
  history: {
    id: number;
    sewa_id: number;
    tgl_selesai: string;
    status_selesai: string;
    harga: number;
    denda: number;
    catatan?: string;
    keterlambatan_menit?: number;
    created_at: string;
    updated_at: string;
  };
  message: string;
}

// Interface untuk Axios error response
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

// Helper untuk handle error
const handleServiceError = (error: unknown, defaultMessage: string): never => {
  if (error instanceof Error) {
    throw error;
  } else {
    throw new Error(defaultMessage);
  }
};

// Helper untuk extract data dengan type safety
const getResponseData = <T>(response: unknown): T => {
  if (!response || typeof response !== "object" || !("data" in response)) {
    throw new Error("Response tidak valid dari server");
  }

  const responseData = response as { data: any };

  // Handle response structure yang berbeda
  if (responseData.data.success && responseData.data.data !== undefined) {
    return responseData.data.data;
  }

  // Fallback untuk response tanpa structure success
  return responseData.data;
};

// Helper untuk extract error message
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosErrorResponse;
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      defaultMessage
    );
  }
  return defaultMessage;
};

export const sewaService = {
  // Get all active sewas
  async getAll(): Promise<Sewa[]> {
    try {
      const response = await api.get("/sewas");
      return getResponseData<Sewa[]>(response);
    } catch (error: unknown) {
      return handleServiceError(error, "Gagal mengambil data sewa");
    }
  },

  // Get single sewa by ID
  async getById(id: number): Promise<Sewa> {
    try {
      const response = await api.get(`/sewas/${id}`);
      return getResponseData<Sewa>(response);
    } catch (error: unknown) {
      return handleServiceError(
        error,
        `Gagal mengambil data sewa dengan ID ${id}`
      );
    }
  },

  // Create new sewa
  async create(data: CreateSewaData): Promise<Sewa> {
    try {
      console.log("Mengirim data create sewa:", data);
      const response = await api.post("/sewas", data);
      return getResponseData<Sewa>(response);
    } catch (error: unknown) {
      console.error("Error creating sewa:", error);

      const errorMessage = getErrorMessage(error, "Gagal membuat sewa baru");
      throw new Error(errorMessage);
    }
  },

  // Update sewa dengan support additional costs
  async update(id: number, data: UpdateSewaData): Promise<Sewa> {
    try {
      console.log(`Mengirim data update sewa ID ${id}:`, data);

      const response = await api.put(`/sewas/${id}`, data);
      return getResponseData<Sewa>(response);
    } catch (error: unknown) {
      console.error(`Error updating sewa ID ${id}:`, error);

      const errorMessage = getErrorMessage(
        error,
        `Gagal memperbarui sewa ID ${id}`
      );
      throw new Error(errorMessage);
    }
  },

  // Complete sewa
  async selesai(
    id: number,
    data: SelesaiSewaData
  ): Promise<SelesaiSewaResponse> {
    try {
      console.log(`Menyelesaikan sewa ID ${id}:`, data);
      const response = await api.post(`/sewas/${id}/selesai`, data);
      return getResponseData<SelesaiSewaResponse>(response);
    } catch (error: unknown) {
      console.error(`Error completing sewa ID ${id}:`, error);

      const errorMessage = getErrorMessage(
        error,
        `Gagal menyelesaikan sewa ID ${id}`
      );
      throw new Error(errorMessage);
    }
  },

  // Delete sewa
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/sewas/${id}`);
      return getResponseData<{ message: string }>(response);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        `Gagal menghapus sewa ID ${id}`
      );
      throw new Error(errorMessage);
    }
  },

  // Get sewa statistics
  async getStats(): Promise<{
    total: number;
    aktif: number;
    selesai: number;
    lewat_tempo: number;
  }> {
    try {
      const allSewas = await this.getAll();
      const now = new Date();

      return {
        total: allSewas.length,
        aktif: allSewas.filter((sewa) => sewa.status === "aktif").length,
        selesai: allSewas.filter((sewa) => sewa.status === "selesai").length,
        lewat_tempo: allSewas.filter(
          (sewa) => sewa.status === "aktif" && new Date(sewa.tgl_kembali) < now
        ).length,
      };
    } catch (error: unknown) {
      console.error("Error getting sewa stats:", error);
      return {
        total: 0,
        aktif: 0,
        selesai: 0,
        lewat_tempo: 0,
      };
    }
  },

  // Extend sewa duration
  async extendSewa(
    id: number,
    newTglKembali: string
    // ✅ PERBAIKAN: Hapus parameter alasan yang tidak digunakan
  ): Promise<Sewa> {
    try {
      const payload: UpdateSewaData = {
        tgl_kembali: newTglKembali,
      };

      return await this.update(id, payload);
    } catch (error: unknown) {
      return handleServiceError(error, `Gagal memperpanjang sewa ID ${id}`);
    }
  },

  // Update catatan sewa
  async updateNotes(id: number, catatan_tambahan: string): Promise<Sewa> {
    try {
      const response = await api.put(`/sewas/${id}/notes`, {
        catatan_tambahan,
      });
      return getResponseData<Sewa>(response);
    } catch (error: unknown) {
      console.error(`Error updating notes for sewa ID ${id}:`, error);

      const errorMessage = getErrorMessage(
        error,
        `Gagal memperbarui catatan sewa ID ${id}`
      );
      throw new Error(errorMessage);
    }
  },
};
