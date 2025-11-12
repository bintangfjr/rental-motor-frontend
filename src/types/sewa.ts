// types/sewa.ts
import { Motor } from "./motor";
import { Penyewa } from "./penyewa";
import { Admin } from "./admin";
import { History } from "./history";

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

export interface Sewa {
  id: number;
  motor_id: number;
  penyewa_id: number;
  admin_id: number;
  status: string; // 'aktif', 'selesai', 'dibatalkan', 'Lewat Tempo'
  jaminan: string | string[] | null; // ✅ Bisa string, array, atau null
  pembayaran: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  durasi_sewa: number;
  tgl_kembali: string | Date;
  tgl_sewa: string | Date;
  total_harga: number;
  status_notifikasi?: string;
  satuan_durasi: string; // 'hari' | 'jam'
  additional_costs?: AdditionalCost[] | string | null; // ✅ Bisa array, string JSON, atau null
  catatan_tambahan?: string | null;

  // ✅ FIELD BARU untuk overdue tracking
  extended_hours?: number;
  is_overdue?: boolean;
  last_overdue_calc?: string | Date | null;
  overdue_hours?: number;
  tgl_actual_kembali?: string | Date | null;

  // Relations
  motor?: Motor;
  penyewa?: Penyewa;
  admin?: Admin;
  histories?: History[];
}

export interface AdditionalCost {
  description: string;
  amount: number;
  type: "discount" | "additional";
}

// ✅ PERBAIKAN: CreateSewaData dengan field yang sesuai backend
export interface CreateSewaData {
  motor_id: number;
  penyewa_id: number;
  tgl_sewa: string;
  tgl_kembali: string;
  jaminan: string[]; // Frontend selalu kirim sebagai array
  pembayaran?: string;
  satuan_durasi: string;
  additional_costs?: AdditionalCost[];
  catatan_tambahan?: string;
}

// ✅ PERBAIKAN: UpdateSewaData dengan field yang bisa diupdate
export interface UpdateSewaData {
  tgl_kembali?: string;
  jaminan?: string[];
  pembayaran?: string;
  additional_costs?: AdditionalCost[];
  catatan_tambahan?: string;
}

export interface SelesaiSewaData {
  tgl_selesai: string;
  catatan?: string;
}

// ✅ PERBAIKAN: Helper untuk parse jaminan dari berbagai format
export const parseJaminan = (jaminan: any): string[] => {
  if (!jaminan) return [];

  if (Array.isArray(jaminan)) {
    return jaminan;
  }

  if (typeof jaminan === "string") {
    try {
      // Coba parse sebagai JSON
      const parsed = JSON.parse(jaminan);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Jika bukan JSON, split by comma
      return jaminan
        .split(",")
        .map((item: string) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

// ✅ PERBAIKAN: Helper untuk parse additional_costs dari berbagai format
export const parseAdditionalCosts = (
  additionalCosts: any
): AdditionalCost[] => {
  if (!additionalCosts) return [];

  if (Array.isArray(additionalCosts)) {
    return additionalCosts;
  }

  if (typeof additionalCosts === "string") {
    try {
      const parsed = JSON.parse(additionalCosts);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      console.warn(
        "Failed to parse additional_costs as JSON:",
        additionalCosts
      );
    }
  }

  return [];
};

// ✅ PERBAIKAN: Type guard yang akurat
export const isCreateSewaData = (data: unknown): data is CreateSewaData => {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;
  return (
    typeof obj.motor_id === "number" &&
    typeof obj.penyewa_id === "number" &&
    typeof obj.tgl_sewa === "string" &&
    typeof obj.tgl_kembali === "string" &&
    Array.isArray(obj.jaminan) &&
    typeof obj.satuan_durasi === "string"
  );
};

export const isUpdateSewaData = (data: unknown): data is UpdateSewaData => {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;

  // Pastikan tidak ada field create yang tidak boleh diupdate
  if (
    typeof obj.motor_id !== "undefined" ||
    typeof obj.penyewa_id !== "undefined" ||
    typeof obj.tgl_sewa !== "undefined"
  ) {
    return false;
  }

  // Validasi field yang ada
  if (obj.tgl_kembali !== undefined && typeof obj.tgl_kembali !== "string")
    return false;
  if (obj.jaminan !== undefined && !Array.isArray(obj.jaminan)) return false;
  if (obj.pembayaran !== undefined && typeof obj.pembayaran !== "string")
    return false;
  if (
    obj.additional_costs !== undefined &&
    !Array.isArray(obj.additional_costs)
  )
    return false;
  if (
    obj.catatan_tambahan !== undefined &&
    typeof obj.catatan_tambahan !== "string"
  )
    return false;

  return true;
};

// ✅ PERBAIKAN: Helper untuk mendapatkan status display
export const getSewaStatusDisplay = (
  sewa: Sewa
): {
  status: string;
  variant: "success" | "warning" | "danger" | "secondary";
  isActive: boolean;
  isOverdue: boolean;
} => {
  const isOverdue =
    sewa.is_overdue ||
    (sewa.status === "aktif" && new Date(sewa.tgl_kembali) < new Date());

  if (sewa.status === "selesai") {
    return {
      status: "Selesai",
      variant: "success",
      isActive: false,
      isOverdue: false,
    };
  }

  if (sewa.status === "dibatalkan") {
    return {
      status: "Dibatalkan",
      variant: "secondary",
      isActive: false,
      isOverdue: false,
    };
  }

  if (isOverdue || sewa.status === "Lewat Tempo") {
    return {
      status: "Lewat Tempo",
      variant: "danger",
      isActive: true,
      isOverdue: true,
    };
  }

  return {
    status: "Aktif",
    variant: "warning",
    isActive: true,
    isOverdue: false,
  };
};
