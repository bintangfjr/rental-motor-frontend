// src/services/dashboardService.ts
import api from "./api";

// ==== INTERFACES ====
export interface DashboardData {
  totalMotor: number;
  motorTersedia: number;
  sewaAktif: number;
  sewaLewatTempo: number;
  pendapatanBulanIni: number;
  sewaTerbaru: SewaTerbaru[];
  motorPerluService: MotorPerluService[];
}

export interface SewaTerbaru {
  id: number;
  status: string;
  tgl_sewa: string;
  tgl_kembali: string;
  total_harga: number;
  motor: {
    id: number;
    plat_nomor: string;
    merk: string;
    model: string;
  };
  penyewa: {
    id: number;
    nama: string;
    no_whatsapp: string;
  };
}

export interface MotorPerluService {
  id: number;
  plat_nomor: string;
  merk: string;
  model: string;
  status: string;
}

// ==== RESPONSE API GENERIC ====
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// ==== SERVICE ====
export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      // Pastikan endpoint sesuai dengan route di backend NestJS
      const response = await api.get<ApiResponse<DashboardData>>("/dashboard");

      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }

      throw new Error(
        response.data?.message || "Dashboard data kosong atau tidak valid",
      );
    } catch (error: unknown) {
      console.error("Error fetching dashboard data:", error);

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error("Gagal mengambil data dashboard");
    }
  },
};
