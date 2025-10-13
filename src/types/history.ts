// types/history.ts
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
  
    // relasi
    sewa?: {
      motor: {
        id: number;
        plat_nomor: string;
        merk: string;
        model: string;
        tahun?: number;
        harga?: number;
      };
      penyewa: {
        id: number;
        nama: string;
        no_whatsapp: string;
        alamat?: string;
      };
      admin?: {
        id: number;
        nama_lengkap: string;
        username: string;
      };
    };
  }
  
  export interface HistoryStats {
    totalHistories: number;
    totalPendapatan: number;
    totalDenda: number;
    statusSummary: Record<string, number>;
    recentHistories: History[];
  }
  