// services/sewaService.ts
import api from "./api";
import {
  Sewa,
  CreateSewaData,
  UpdateSewaData,
  SelesaiSewaData,
  Motor,
} from "../types/sewa";

// Interface untuk response selesai sewa
export interface SelesaiSewaResponse {
  message: string;
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
  denda?: number;
  keterlambatan_menit?: number;
  keterlambatan_jam?: number;
}

// Interface untuk perpanjang sewa response
interface PerpanjangSewaResponse {
  sewa: Sewa;
  extended_hours: number;
  biaya_perpanjangan: number;
}

// Interface untuk Axios error response
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
}

// Interface untuk stats
interface SewaStats {
  total: number;
  aktif: number;
  selesai: number;
  lewat_tempo: number;
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

// ✅ PERBAIKAN: Hapus filter status aktif - ambil semua data
const prepareCreateData = (data: CreateSewaData): CreateSewaData => {
  const preparedData = { ...data };
  return preparedData;
};

const prepareUpdateData = (data: UpdateSewaData): UpdateSewaData => {
  const preparedData = { ...data };
  return preparedData;
};

// ✅ Untuk selesai sewa, tetap perlu konversi ke ISO format
const prepareSelesaiData = (data: SelesaiSewaData): SelesaiSewaData => {
  const preparedData = { ...data };

  // Jika format datetime-local (16 karakter), konversi ke format backend
  if (
    preparedData.tgl_selesai &&
    preparedData.tgl_selesai.includes("T") &&
    preparedData.tgl_selesai.length === 16
  ) {
    // Format: "2025-11-09T13:24" -> biarkan seperti ini untuk backend
    console.log("🕐 Format tanggal selesai:", preparedData.tgl_selesai);
  }

  return preparedData;
};

export const sewaService = {
  // ✅ PERBAIKAN: Get ALL sewas tanpa filter status
  async getAll(): Promise<Sewa[]> {
    try {
      const response = await api.get("/sewas");
      return getResponseData<Sewa[]>(response);
    } catch (error: unknown) {
      return handleServiceError(error, "Gagal mengambil data sewa");
    }
  },

  // ✅ NEW: Get only active sewas
  async getActive(): Promise<Sewa[]> {
    try {
      const response = await api.get("/sewas?status=aktif");
      return getResponseData<Sewa[]>(response);
    } catch (error: unknown) {
      return handleServiceError(error, "Gagal mengambil data sewa aktif");
    }
  },

  // ✅ NEW: Get overdue sewas
  async getOverdue(): Promise<Sewa[]> {
    try {
      const response = await api.get("/sewas/overdue");
      return getResponseData<Sewa[]>(response);
    } catch (error: unknown) {
      return handleServiceError(error, "Gagal mengambil data sewa overdue");
    }
  },

  // ✅ NEW: Get completed sewas dari histories
  async getCompleted(): Promise<any[]> {
    try {
      const response = await api.get("/histories");
      return getResponseData<any[]>(response);
    } catch (error: unknown) {
      return handleServiceError(error, "Gagal mengambil data sewa selesai");
    }
  },

  // ✅ PERBAIKAN: Get all sewas with status filter
  async getByStatus(status?: string): Promise<Sewa[]> {
    try {
      const url = status ? `/sewas?status=${status}` : "/sewas";
      const response = await api.get(url);
      return getResponseData<Sewa[]>(response);
    } catch (error: unknown) {
      return handleServiceError(error, "Gagal mengambil data sewa");
    }
  },

  // ✅ FIXED: Get single sewa by ID dengan handling 404 yang baik
  async getById(id: number): Promise<Sewa> {
    try {
      const response = await api.get(`/sewas/${id}`);
      return getResponseData<Sewa>(response);
    } catch (error: unknown) {
      // Handle 404 error khusus - data sudah dihapus karena selesai
      if (this.isNotFoundError(error)) {
        throw new Error(
          `Sewa dengan ID ${id} sudah selesai dan tidak ditemukan`
        );
      }
      return handleServiceError(
        error,
        `Gagal mengambil data sewa dengan ID ${id}`
      );
    }
  },

  // ✅ Helper untuk cek error 404
  isNotFoundError(error: unknown): boolean {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosErrorResponse;
      return axiosError.response?.status === 404;
    }
    return false;
  },

  // Create new sewa - SIMPLE FORMAT
  async create(data: CreateSewaData): Promise<Sewa> {
    try {
      const preparedData = prepareCreateData(data);
      console.log("🆕 Mengirim data create sewa:", preparedData);

      const response = await api.post("/sewas", preparedData);
      return getResponseData<Sewa>(response);
    } catch (error: unknown) {
      console.error("❌ Error creating sewa:", error);
      const errorMessage = getErrorMessage(error, "Gagal membuat sewa baru");
      throw new Error(errorMessage);
    }
  },

  // Update sewa - SIMPLE FORMAT
  async update(id: number, data: UpdateSewaData): Promise<Sewa> {
    try {
      const preparedData = prepareUpdateData(data);
      console.log(`🔄 Mengirim data update sewa ID ${id}:`, preparedData);

      const response = await api.put(`/sewas/${id}`, preparedData);
      return getResponseData<Sewa>(response);
    } catch (error: unknown) {
      console.error(`❌ Error updating sewa ID ${id}:`, error);

      // Handle 404 error - data sudah dihapus
      if (this.isNotFoundError(error)) {
        throw new Error(
          `Sewa dengan ID ${id} sudah selesai dan tidak dapat diupdate`
        );
      }

      const errorMessage = getErrorMessage(
        error,
        `Gagal memperbarui sewa ID ${id}`
      );
      throw new Error(errorMessage);
    }
  },

  // ✅ PERPANJANGAN: Method untuk perpanjang sewa
  async perpanjang(
    id: number,
    tgl_kembali_baru: string
  ): Promise<PerpanjangSewaResponse> {
    try {
      console.log(`📅 Memperpanjang sewa ID ${id}:`, { tgl_kembali_baru });

      const response = await api.put(`/sewas/${id}/perpanjang`, {
        tgl_kembali_baru,
      });
      return getResponseData<PerpanjangSewaResponse>(response);
    } catch (error: unknown) {
      console.error(`❌ Error extending sewa ID ${id}:`, error);

      // Handle 404 error - data sudah dihapus
      if (this.isNotFoundError(error)) {
        throw new Error(
          `Sewa dengan ID ${id} sudah selesai dan tidak dapat diperpanjang`
        );
      }

      const errorMessage = getErrorMessage(
        error,
        `Gagal memperpanjang sewa ID ${id}`
      );
      throw new Error(errorMessage);
    }
  },

  // ✅ FIXED: Complete sewa dengan handling redirect setelah sukses
  async selesai(
    id: number,
    data: SelesaiSewaData
  ): Promise<SelesaiSewaResponse> {
    try {
      const preparedData = prepareSelesaiData(data);
      console.log(`✅ Menyelesaikan sewa ID ${id}:`, preparedData);

      const response = await api.post(`/sewas/${id}/selesai`, preparedData);
      return getResponseData<SelesaiSewaResponse>(response);
    } catch (error: unknown) {
      console.error(`❌ Error completing sewa ID ${id}:`, error);

      // Debug detail error response
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosErrorResponse;
        const backendError = axiosError.response?.data;

        console.error("🔍 DETAIL ERROR RESPONSE:", {
          status: axiosError.response?.status,
          data: backendError,
        });

        // Coba extract error message yang lebih spesifik dari backend
        if (backendError) {
          // Jika backend mengembalikan message spesifik
          if (
            backendError.message &&
            backendError.message !== "Gagal menyelesaikan sewa"
          ) {
            throw new Error(backendError.message);
          }

          // Cek jika ada validation errors
          if (backendError.error && typeof backendError.error === "string") {
            throw new Error(backendError.error);
          }

          // Cek jika ada array errors
          if (Array.isArray(backendError.message)) {
            const errorMessages = backendError.message.join(", ");
            throw new Error(errorMessages);
          }
        }
      }

      // Default error message dengan informasi tambahan
      const errorMessage = `Gagal menyelesaikan sewa ID ${id}. Status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      throw new Error(errorMessage);
    }
  },

  // ✅ FIXED: Delete sewa dengan handling 404
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/sewas/${id}`);
      return getResponseData<{ message: string }>(response);
    } catch (error: unknown) {
      // Handle 404 error - data sudah dihapus
      if (this.isNotFoundError(error)) {
        throw new Error(`Sewa dengan ID ${id} sudah dihapus`);
      }

      const errorMessage = getErrorMessage(
        error,
        `Gagal menghapus sewa ID ${id}`
      );
      throw new Error(errorMessage);
    }
  },

  // ✅ PERBAIKAN: Get sewa statistics yang benar
  async getStats(): Promise<SewaStats> {
    try {
      // Ambil semua data untuk statistik yang akurat
      const [allSewas, overdueSewas, histories] = await Promise.all([
        this.getAll(),
        this.getOverdue(),
        this.getCompleted(),
      ]);

      return {
        total: allSewas.length + histories.length, // Total semua sewa (aktif + selesai)
        aktif: allSewas.filter((sewa) => sewa.status === "aktif").length,
        selesai: histories.length, // Yang sudah selesai dari histories
        lewat_tempo: overdueSewas.length, // Yang overdue dari endpoint khusus
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

  // ✅ UPDATE: Extend sewa duration menggunakan method perpanjang
  async extendSewa(
    id: number,
    newTglKembali: string
  ): Promise<PerpanjangSewaResponse> {
    try {
      console.log(`📅 Memperpanjang sewa ID ${id}:`, { newTglKembali });
      return await this.perpanjang(id, newTglKembali);
    } catch (error: unknown) {
      return handleServiceError(error, `Gagal memperpanjang sewa ID ${id}`);
    }
  },

  // ✅ FIXED: Update catatan sewa dengan handling 404
  async updateNotes(id: number, catatan_tambahan: string): Promise<Sewa> {
    try {
      const response = await api.put(`/sewas/${id}/notes`, {
        catatan_tambahan,
      });
      return getResponseData<Sewa>(response);
    } catch (error: unknown) {
      console.error(`❌ Error updating notes for sewa ID ${id}:`, error);

      // Handle 404 error - data sudah dihapus
      if (this.isNotFoundError(error)) {
        throw new Error(
          `Sewa dengan ID ${id} sudah selesai dan tidak dapat diupdate`
        );
      }

      const errorMessage = getErrorMessage(
        error,
        `Gagal memperbarui catatan sewa ID ${id}`
      );
      throw new Error(errorMessage);
    }
  },

  // ✅ NEW: Get history by sewa_id
  async getHistoryBySewaId(sewaId: number): Promise<any> {
    try {
      const response = await api.get(`/histories?sewa_id=${sewaId}`);
      const histories = getResponseData<any[]>(response);
      return histories.length > 0 ? histories[0] : null;
    } catch (error: unknown) {
      console.error(`Error getting history for sewa ID ${sewaId}:`, error);
      return null;
    }
  },

  // ✅ PERBAIKAN FIX: Check if sewa is overdue - prioritaskan status dari backend
  isSewaOverdue(sewa: Sewa): boolean {
    // Jika status sudah "Lewat Tempo" dari backend, langsung return true
    if (sewa.status === "Lewat Tempo") return true;

    // Hanya cek untuk sewa aktif
    if (sewa.status !== "aktif") return false;

    const now = new Date();
    const tglKembali = new Date(sewa.tgl_kembali);
    return now > tglKembali;
  },

  // ✅ PERBAIKAN FIX: Calculate overdue hours dengan handling untuk semua kasus
  calculateOverdueHours(sewa: Sewa): number {
    // Jika status sudah "Lewat Tempo" dari backend, hitung berdasarkan waktu sekarang
    if (sewa.status === "Lewat Tempo") {
      const now = new Date();
      const tglKembali = new Date(sewa.tgl_kembali);
      const diffMs = now.getTime() - tglKembali.getTime();
      return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
    }

    // Untuk status aktif, cek apakah lewat tempo
    if (!this.isSewaOverdue(sewa)) return 0;

    const now = new Date();
    const tglKembali = new Date(sewa.tgl_kembali);
    const diffMs = now.getTime() - tglKembali.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60));
  },

  // ✅ PERBAIKAN FIX: Calculate estimated denda dengan type safety
  calculateEstimatedDenda(sewa: Sewa): number {
    if (!this.isSewaOverdue(sewa)) return 0;

    const overdueHours = this.calculateOverdueHours(sewa);

    // ✅ PERBAIKAN: Handle kemungkinan motor undefined
    if (!sewa.motor || !sewa.motor.harga) {
      console.warn("Data motor tidak tersedia untuk perhitungan denda");
      return 0;
    }

    const hargaPerJam = Math.ceil(sewa.motor.harga / 24);
    return Math.ceil(hargaPerJam * 0.5 * overdueHours);
  },

  // ✅ PERBAIKAN FIX: Helper untuk mendapatkan status display yang benar
  getStatusDisplay(sewa: Sewa): {
    status: string;
    variant: "success" | "warning" | "danger" | "secondary";
  } {
    // Prioritaskan status dari backend
    if (sewa.status === "selesai") {
      return { status: "Selesai", variant: "success" };
    }
    if (sewa.status === "dibatalkan") {
      return { status: "Dibatalkan", variant: "secondary" };
    }
    if (sewa.status === "Lewat Tempo") {
      return { status: "Lewat Tempo", variant: "danger" };
    }

    // Untuk status aktif, cek apakah lewat tempo
    const isOverdue = this.isSewaOverdue(sewa);
    if (isOverdue) {
      return { status: "Lewat Tempo", variant: "danger" };
    }

    return { status: "Aktif", variant: "warning" };
  },

  // ✅ PERBAIKAN FIX: Check if sewa can be extended
  canExtendSewa(sewa: Sewa): boolean {
    return sewa.status === "aktif" || sewa.status === "Lewat Tempo";
  },

  // ✅ PERBAIKAN FIX: Check if sewa can be completed
  canCompleteSewa(sewa: Sewa): boolean {
    return sewa.status === "aktif" || sewa.status === "Lewat Tempo";
  },

  // ✅ NEW: Helper untuk mengecek apakah sewa aktif (untuk komponen)
  isSewaAktif(sewa: Sewa): boolean {
    return sewa.status === "aktif" || sewa.status === "Lewat Tempo";
  },
};
