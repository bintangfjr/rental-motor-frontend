// types/motor.ts
export interface Motor {
  id: number;
  plat_nomor: string;
  merk: string;
  model: string;
  tahun: number;
  harga: number;
  no_gsm?: string;
  imei?: string;
  status: "tersedia" | "disewa" | "perbaikan";
  device_id?: string;
  lat?: number;
  lng?: number;
  last_update?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMotorData {
  plat_nomor: string;
  merk: string;
  model: string;
  tahun: number;
  harga: number;
  no_gsm?: string;
  imei?: string;
  status: "tersedia" | "disewa" | "perbaikan";
}

// ✅ PERBAIKAN: Definisikan secara eksplisit
export interface UpdateMotorData {
  plat_nomor?: string;
  merk?: string;
  model?: string;
  tahun?: number;
  harga?: number;
  no_gsm?: string;
  imei?: string;
  status?: "tersedia" | "disewa" | "perbaikan";
  device_id?: string;
  lat?: number;
  lng?: number;
  last_update?: string;
}
