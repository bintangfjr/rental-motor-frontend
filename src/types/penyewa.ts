// types/penyewa.ts (Versi Sederhana)
export interface Penyewa {
  id: number;
  nama: string;
  alamat?: string;
  foto_ktp?: string | null;
  no_whatsapp: string;
  is_blacklisted: boolean;
  created_at: string;
  updated_at: string;
  // Optional fields untuk relasi
  sewas_aktif_count?: number;
  sewas?: any[];
  _count?: {
    sewas?: number;
  };
  // Fields untuk sync offline
  _isTemp?: boolean;
  _needsSync?: boolean;
}

export interface CreatePenyewaData {
  nama: string;
  alamat?: string;
  no_whatsapp: string;
  foto_ktp?: string | File | null;
}

export interface UpdatePenyewaData {
  nama?: string;
  alamat?: string;
  foto_ktp?: string | File | null; // ✅ Bisa string, File, atau null (untuk hapus)
  no_whatsapp?: string;
  is_blacklisted?: boolean;
}

export interface UpdatePenyewaData extends Partial<CreatePenyewaData> {
  is_blacklisted?: boolean;
}

// Default values
export const DEFAULT_PENYEWA: Partial<Penyewa> = {
  is_blacklisted: false,
  alamat: "",
  foto_ktp: null,
};

export const DEFAULT_CREATE_PENYEWA_DATA: CreatePenyewaData = {
  nama: "",
  alamat: "",
  no_whatsapp: "",
  foto_ktp: null,
};

// Utility types
export type PenyewaField = keyof CreatePenyewaData | keyof UpdatePenyewaData;

export interface PenyewaFormErrors {
  [key: string]: string;
}
