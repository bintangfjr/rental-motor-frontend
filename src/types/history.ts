export interface History {
  id: number;
  sewa_id: number;
  tgl_selesai: Date;
  status_selesai: string;
  harga: number;
  denda: number;
  catatan?: string;
  created_at: Date;
  updated_at: Date;
  keterlambatan_menit?: number;

  // ✅ DATA LANGSUNG DARI FIELD HISTORIES
  motor_plat: string;
  motor_merk: string;
  motor_model: string;
  tahun_motor: number;
  penyewa_nama: string;
  penyewa_whatsapp: string;
  admin_nama: string;
  tgl_sewa: Date;
  tgl_kembali: Date;
  durasi_sewa: number;
  satuan_durasi: string;
  jaminan?: string;
  pembayaran?: string;
  additional_costs?: string;
  catatan_tambahan?: string;
}

export interface HistoryStats {
  totalSelesai: number;
  totalDenda: number;
  totalPendapatan: number;
  rataRataDurasi: number;
}

export interface HistoryResponse {
  data: History[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface HistoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}
