export interface DashboardStats {
  jumlahSewaAktif: number;
  jumlahMotorTersedia: number;
  totalPendapatan: number;
  totalPenyewaAktif: number;
  motorPerStatus: {
    [key: string]: number;
  };
  sewaPerBulan: Array<{
    bulan: string;
    total: number;
  }>;
}

export interface MonthlyReport {
  periode: string;
  totalSewa: number;
  totalPendapatan: number;
  sewaPerHari: Array<{
    tanggal: string;
    total: number;
  }>;
  motorTerpopuler: Array<{
    motor_plat: string;
    motor_merk: string;
    motor_model: string;
    total_sewa: number;
  }>;
  penyewaTeraktif: Array<{
    penyewa_nama: string;
    penyewa_whatsapp: string;
    total_sewa: number;
  }>;
}

export interface MotorUsage {
  id: number;
  plat_nomor: string;
  merk: string;
  model: string;
  status: string;
  total_sewa: number;
  total_durasi: number;
  total_pendapatan: number;
}

export interface FinancialReport {
  periode: {
    start: string;
    end: string;
  };
  totalPendapatan: number;
  totalDenda: number;
  pendapatanPerBulan: Array<{
    bulan: string;
    pendapatan: number;
  }>;
  pendapatanPerMotor: Array<{
    motor_plat: string;
    motor_merk: string;
    motor_model: string;
    total_pendapatan: number;
  }>;
}

// ✅ NEW TYPES FOR BACKUP DATA
export interface BackupReport {
  periode: {
    start: string;
    end: string;
  };
  totalRecords: number;
  totalPendapatan: number;
  totalDenda: number;
  data: HistoryRecord[];
}

export interface HistoryRecord {
  id: number;
  sewa_id: number;
  tgl_selesai: string;
  status_selesai: string;
  harga: number;
  denda: number;
  catatan?: string;
  created_at: string;
  updated_at: string;
  keterlambatan_menit?: number;
  motor_plat: string;
  motor_merk: string;
  motor_model: string;
  tahun_motor: number;
  penyewa_nama: string;
  penyewa_whatsapp: string;
  admin_nama: string;
  tgl_sewa: string;
  tgl_kembali: string;
  durasi_sewa: number;
  satuan_durasi: string;
  jaminan?: string;
  pembayaran?: string;
  additional_costs?: string;
  catatan_tambahan?: string;
}

export interface ExportBackupData {
  periode: {
    start: string;
    end: string;
  };
  totalRecords: number;
  data: Array<{
    "ID Sewa": number;
    "Tanggal Selesai": string;
    "Status Selesai": string;
    Harga: number;
    Denda: number;
    "Keterlambatan (menit)": number;
    Catatan: string;
    "Plat Motor": string;
    "Merk Motor": string;
    "Model Motor": string;
    "Tahun Motor": number;
    "Nama Penyewa": string;
    "WhatsApp Penyewa": string;
    "Nama Admin": string;
    "Tanggal Sewa": string;
    "Tanggal Kembali": string;
    "Durasi Sewa": number;
    "Satuan Durasi": string;
    Jaminan: string;
    Pembayaran: string;
    "Biaya Tambahan": string;
    "Catatan Tambahan": string;
    "Created At": string;
    "Updated At": string;
  }>;
}
