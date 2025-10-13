// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Loading from "@/components/ui/Loading";
import { Link } from "react-router-dom";
import api from "@/services/api";

// ==== Interfaces ==== //
interface MotorPerluService {
  id: number;
  plat_nomor: string;
  merk: string;
  model: string;
  status: string;
}

interface SewaTerbaru {
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
    id: string;
    nama: string;
    no_whatsapp: string;
  };
}

interface DashboardData {
  totalMotor: number;
  motorTersedia: number;
  sewaAktif: number;
  sewaLewatTempo: number;
  totalSewa: number;
  pendapatanBulanIni: number;
  sewaTerbaru: SewaTerbaru[];
  motorPerluService: MotorPerluService[];
  totalAdmins: number;
  totalUsers: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

type BadgeVariant =
  | "success"
  | "danger"
  | "secondary"
  | "primary"
  | "warning"
  | "info";

// ==== Component ==== //
const Dashboard: React.FC = () => {
  const { admin } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await api.get<ApiResponse<DashboardData>>(
          "/dashboard"
        );
        setDashboardData(response.data.data);
      } catch (err: unknown) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // ==== Helpers ==== //
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "Aktif":
        return "success";
      case "Lewat Tempo":
        return "danger";
      case "Selesai":
        return "secondary";
      default:
        return "primary";
    }
  };

  // ==== Render ==== //
  if (loading) return <Loading />;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header Page */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Selamat datang, {admin?.nama_lengkap ?? "Admin"}
        </p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Total Motor
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {dashboardData?.totalMotor ?? 0}
          </p>
        </Card>
        <Card className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Motor Tersedia
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {dashboardData?.motorTersedia ?? 0}
          </p>
        </Card>
        <Card className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Sewa Aktif</h3>
          <p className="text-3xl font-bold text-purple-600">
            {dashboardData?.sewaAktif ?? 0}
          </p>
        </Card>
        <Card className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Lewat Tempo
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {dashboardData?.sewaLewatTempo ?? 0}
          </p>
        </Card>
      </div>

      {/* Pendapatan & Statistik Lainnya */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-white rounded-lg shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pendapatan Bulan Ini
          </h2>
          <p className="text-3xl font-bold text-green-600">
            {dashboardData
              ? formatCurrency(dashboardData.pendapatanBulanIni)
              : "Rp 0"}
          </p>
        </Card>
        <Card className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Statistik Lainnya
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Sewa</span>
              <span className="font-semibold">
                {dashboardData?.totalSewa ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Admin</span>
              <span className="font-semibold">
                {dashboardData?.totalAdmins ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Pengguna</span>
              <span className="font-semibold">
                {dashboardData?.totalUsers ?? 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sewa Terbaru & Motor Perlu Service */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sewa Terbaru */}
        <Card className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Sewa Terbaru
            </h2>
            <Link to="/sewas">
              <Button variant="outline" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData?.sewaTerbaru?.length ? (
              dashboardData.sewaTerbaru.map((sewa) => (
                <div
                  key={`sewa-${sewa.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {sewa.penyewa.nama}
                      </span>
                      <Badge variant={getStatusBadgeVariant(sewa.status)}>
                        {sewa.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {sewa.motor.merk} {sewa.motor.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sewa.motor.plat_nomor}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(sewa.total_harga)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Kembali: {formatDate(sewa.tgl_kembali)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Tidak ada sewa aktif
              </p>
            )}
          </div>
        </Card>

        {/* Motor Perlu Service */}
        <Card className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Motor Perlu Service
            </h2>
            <Link to="/motors">
              <Button variant="outline" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData?.motorPerluService?.length ? (
              dashboardData.motorPerluService.map((motor) => (
                <div
                  key={`motor-${motor.id}`}
                  className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {motor.merk} {motor.model}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {motor.plat_nomor}
                    </p>
                  </div>
                  <Badge variant="warning" className="whitespace-nowrap">
                    Perlu Service
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Semua motor dalam kondisi baik
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
