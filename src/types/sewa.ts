// types/sewa.ts
import { Motor } from "./motor";
import { Penyewa } from "./penyewa";
import { Admin } from "./admin";
import { History } from "./history";

export interface Sewa {
  id: number;
  motor_id: number;
  penyewa_id: number;
  admin_id: number;
  status: string;
  jaminan: string | null;
  pembayaran: string | null;
  durasi_sewa: number;
  tgl_sewa: string | Date;
  tgl_kembali: string | Date;
  total_harga: number;
  satuan_durasi: string;
  status_notifikasi?: string;
  created_at: string | Date;
  updated_at: string | Date;
  motor?: Motor;
  penyewa?: Penyewa;
  admin?: Admin;
  additional_costs?: AdditionalCost[];
  histories?: History[];
  catatan_tambahan?: string;
}

// ✅ PERBAIKAN: Konsistensi jaminan sebagai string[]
export interface CreateSewaData {
  motor_id: number;
  penyewa_id: number;
  tgl_sewa: string;
  tgl_kembali: string;
  jaminan: string[]; // ✅ Diubah dari string ke string[]
  pembayaran: string;
  satuan_durasi: string;
  catatan_tambahan?: string;
}

// Untuk update sewa yang sudah ada
export interface UpdateSewaData {
  tgl_kembali?: string;
  jaminan?: string[]; // ✅ Tetap string[]
  pembayaran?: string;
  additional_costs?: AdditionalCost[];
  catatan_tambahan?: string;
}

export interface AdditionalCost {
  description: string;
  amount: number;
  type: "discount" | "additional";
}

// Untuk menyelesaikan sewa
export interface SelesaiSewaData {
  tgl_selesai: string;
  catatan?: string;
}

// ✅ PERBAIKAN: Type guard yang lebih akurat untuk CreateSewaData
export const isCreateSewaData = (data: unknown): data is CreateSewaData => {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;
  return (
    typeof obj.motor_id === "number" &&
    typeof obj.penyewa_id === "number" &&
    typeof obj.tgl_sewa === "string" &&
    typeof obj.tgl_kembali === "string" &&
    Array.isArray(obj.jaminan) &&
    typeof obj.pembayaran === "string" &&
    typeof obj.satuan_durasi === "string"
  );
};

// ✅ PERBAIKAN: Type guard yang lebih akurat untuk UpdateSewaData
export const isUpdateSewaData = (data: unknown): data is UpdateSewaData => {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;

  // Pastikan tidak ada field create
  if (
    typeof obj.motor_id !== "undefined" ||
    typeof obj.penyewa_id !== "undefined"
  ) {
    return false;
  }

  // Validasi field yang ada
  if (obj.tgl_kembali !== undefined && typeof obj.tgl_kembali !== "string")
    return false;
  if (obj.jaminan !== undefined && !Array.isArray(obj.jaminan)) return false;
  if (obj.pembayaran !== undefined && typeof obj.pembayaran !== "string")
    return false;

  return true;
};
