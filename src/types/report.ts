export interface DashboardStats {
    jumlahSewaAktif: number;
    jumlahMotorTersedia: number;
    totalPendapatan: number;
    totalPenyewaAktif: number;
    motorPerStatus: Record<string, number>;
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
      hari: string;
      total: number;
    }>;
    motorTerpopuler: Array<{
      motor: {
        plat_nomor: string;
        merk: string;
        model: string;
      };
      _count: {
        id: number;
      };
    }>;
    penyewaTeraktif: Array<{
      penyewa: {
        nama: string;
        no_whatsapp: string;
      };
      _count: {
        id: number;
      };
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
    sewas: Array<{
      id: number;
      durasi_sewa: number;
      total_harga: number;
      status: string;
      created_at: Date;
    }>;
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
      motor: {
        plat_nomor: string;
        merk: string;
        model: string;
      };
      _sum: {
        total_harga: number;
      };
    }>;
  }