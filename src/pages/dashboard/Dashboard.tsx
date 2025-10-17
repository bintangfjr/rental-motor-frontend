// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Loading from "@/components/ui/Loading";
import { Link } from "react-router-dom";
import api from "@/services/api";

// ==== Icons ==== //
const IconMotor = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const IconAvailable = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const IconActive = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const IconWarning = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

const IconMoney = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
);

const IconUsers = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

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

// ==== Stat Card Component ==== //
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "red" | "orange" | "indigo";
  format?: "number" | "currency";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  format = "number",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
  };

  const formatValue = (val: number | string) => {
    if (format === "currency" && typeof val === "number") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(val);
    }
    return val;
  };

  return (
    <Card
      className={`p-6 border-2 ${colorClasses[color]} transition-all duration-200 hover:scale-105 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <p className="text-2xl font-bold">{formatValue(value)}</p>
        </div>
        <div
          className={`p-3 rounded-full ${colorClasses[color]} bg-opacity-20`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

// ==== Main Component ==== //
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
  if (error)
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/30 p-6 space-y-8">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Selamat datang kembali,{" "}
            <span className="font-semibold text-blue-600">
              {admin?.nama_lengkap ?? "Admin"}
            </span>
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Statistik Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Motor"
          value={dashboardData?.totalMotor ?? 0}
          icon={<IconMotor />}
          color="blue"
        />
        <StatCard
          title="Motor Tersedia"
          value={dashboardData?.motorTersedia ?? 0}
          icon={<IconAvailable />}
          color="green"
        />
        <StatCard
          title="Sewa Aktif"
          value={dashboardData?.sewaAktif ?? 0}
          icon={<IconActive />}
          color="purple"
        />
        <StatCard
          title="Lewat Tempo"
          value={dashboardData?.sewaLewatTempo ?? 0}
          icon={<IconWarning />}
          color="red"
        />
      </div>

      {/* Pendapatan & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pendapatan Card */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Pendapatan Bulan Ini
            </h2>
            <IconMoney />
          </div>
          <p className="text-4xl font-bold text-green-700 mb-2">
            {dashboardData
              ? formatCurrency(dashboardData.pendapatanBulanIni)
              : "Rp 0"}
          </p>
          <p className="text-green-600 text-sm">
            Total pendapatan dari semua sewa aktif bulan ini
          </p>
        </Card>

        {/* Overview Card */}
        <Card className="p-6 bg-white border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Overview Sistem
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IconUsers />
                </div>
                <span className="text-gray-700">Total Sewa</span>
              </div>
              <span className="font-bold text-blue-600">
                {dashboardData?.totalSewa ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Total Admin</span>
              </div>
              <span className="font-bold text-purple-600">
                {dashboardData?.totalAdmins ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Total Pengguna</span>
              </div>
              <span className="font-bold text-green-600">
                {dashboardData?.totalUsers ?? 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sewa Terbaru & Motor Perlu Service */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Sewa Terbaru */}
        <Card className="p-6 bg-white border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Sewa Terbaru
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                5 transaksi sewa terbaru
              </p>
            </div>
            <Link to="/sewas">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <span>Lihat Semua</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {dashboardData?.sewaTerbaru?.length ? (
              dashboardData.sewaTerbaru.slice(0, 5).map((sewa) => (
                <div
                  key={`sewa-${sewa.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900 truncate">
                          {sewa.penyewa.nama}
                        </span>
                        <Badge
                          variant={getStatusBadgeVariant(sewa.status)}
                          size="sm"
                        >
                          {sewa.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {sewa.motor.merk} {sewa.motor.model} •{" "}
                        {sewa.motor.plat_nomor}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Kembali: {formatDate(sewa.tgl_kembali)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(sewa.total_harga)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-500">Tidak ada sewa aktif</p>
              </div>
            )}
          </div>
        </Card>

        {/* Motor Perlu Service */}
        <Card className="p-6 bg-white border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Motor Perlu Service
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Motor yang memerlukan perawatan
              </p>
            </div>
            <Link to="/motors">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <span>Lihat Semua</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData?.motorPerluService?.length ? (
              dashboardData.motorPerluService.map((motor) => (
                <div
                  key={`motor-${motor.id}`}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {motor.merk} {motor.model}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {motor.plat_nomor}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="warning"
                    className="whitespace-nowrap bg-orange-100 text-orange-700 border-orange-200"
                  >
                    Perlu Service
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <svg
                  className="w-16 h-16 text-green-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-500">Semua motor dalam kondisi baik</p>
                <p className="text-sm text-gray-400 mt-1">
                  Tidak ada motor yang perlu service
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
