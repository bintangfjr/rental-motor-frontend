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
  totalAdmins: number;
  totalUsers: number;
  statistikHarian: SewaHarianResponse; // ✅ DITAMBAHKAN
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

// ✅ INTERFACE BARU: Statistik Sewa Harian
export interface SewaHarianStats {
  tanggal: string;
  jumlah_sewa: number;
  total_pendapatan: number;
}

export interface SewaHarianResponse {
  hari_ini: number;
  kemarin: number;
  persentase_perubahan: number;
  tren_harian: SewaHarianStats[];
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
      const response = await api.get<ApiResponse<DashboardData>>("/dashboard");

      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }

      throw new Error(
        response.data?.message || "Dashboard data kosong atau tidak valid"
      );
    } catch (error: unknown) {
      console.error("Error fetching dashboard data:", error);

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error("Gagal mengambil data dashboard");
    }
  },

  // ✅ SERVICE BARU: Statistik Sewa Harian
  async getSewaHarianStats(
    period: "7days" | "30days" = "7days"
  ): Promise<SewaHarianResponse> {
    try {
      const response = await api.get<ApiResponse<SewaHarianResponse>>(
        `/dashboard/sewa-harian?period=${period}`
      );

      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }

      throw new Error(
        response.data?.message || "Data statistik harian tidak valid"
      );
    } catch (error: unknown) {
      console.error("Error fetching sewa harian stats:", error);

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error("Gagal mengambil data statistik harian");
    }
  },

  // ✅ SERVICE BARU: Statistik Pendapatan Harian
  async getPendapatanHarianStats(period: "7days" | "30days" = "7days") {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/dashboard/pendapatan-harian?period=${period}`
      );

      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }

      throw new Error(
        response.data?.message || "Data pendapatan harian tidak valid"
      );
    } catch (error: unknown) {
      console.error("Error fetching pendapatan harian stats:", error);

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error("Gagal mengambil data pendapatan harian");
    }
  },
};
