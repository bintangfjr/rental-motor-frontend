// src/pages/dashboard/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import api from "@/services/api";
import { useTheme } from "@/hooks/useTheme"; // Tambahkan useTheme

// Import komponen modular
import StatsCard from "./StatsCard";
import RecentActivity from "./RecentActivity";

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

// ==== Main Component ==== //
const Dashboard: React.FC = () => {
  const { admin } = useAuth();
  const { isDark } = useTheme(); // Ambil theme state
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

  if (loading) return <Loading />;
  if (error)
    return (
      <div
        className={`p-4 rounded-lg ${
          isDark ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"
        }`}
      >
        Error: {error}
      </div>
    );

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 space-y-6 sm:space-y-8 ${
        isDark
          ? "bg-dark-primary text-dark-primary"
          : "bg-gray-50/30 text-gray-900"
      }`}
    >
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Dashboard
          </h1>
          <p
            className={`mt-1 sm:mt-2 text-sm sm:text-base ${
              isDark ? "text-dark-secondary" : "text-gray-600"
            }`}
          >
            Selamat datang kembali,{" "}
            <span
              className={`font-semibold ${
                isDark ? "text-brand-blue" : "text-blue-600"
              }`}
            >
              {admin?.nama_lengkap ?? "Admin"}
            </span>
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <p
            className={`text-xs sm:text-sm ${
              isDark ? "text-dark-muted" : "text-gray-500"
            }`}
          >
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Statistik Cards Grid - Compact di Mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Motor"
          value={dashboardData?.totalMotor ?? 0}
          icon={<IconMotor />}
          color="blue"
          compact
        />
        <StatsCard
          title="Motor Tersedia"
          value={dashboardData?.motorTersedia ?? 0}
          icon={<IconAvailable />}
          color="green"
          compact
        />
        <StatsCard
          title="Sewa Aktif"
          value={dashboardData?.sewaAktif ?? 0}
          icon={<IconActive />}
          color="purple"
          compact
        />
        <StatsCard
          title="Lewat Tempo"
          value={dashboardData?.sewaLewatTempo ?? 0}
          icon={<IconWarning />}
          color="red"
          compact
        />
      </div>

      {/* Pendapatan & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Pendapatan Card */}
        <Card
          className={`p-4 sm:p-6 border lg:col-span-2 ${
            isDark
              ? "bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/30"
              : "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200"
          }`}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2
              className={`text-lg sm:text-xl font-semibold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Pendapatan Bulan Ini
            </h2>
            <IconMoney isDark={isDark} />
          </div>
          <p
            className={`text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 ${
              isDark ? "text-green-400" : "text-green-700"
            }`}
          >
            {dashboardData
              ? formatCurrency(dashboardData.pendapatanBulanIni)
              : "Rp 0"}
          </p>
          <p
            className={`text-xs sm:text-sm ${
              isDark ? "text-green-300" : "text-green-600"
            }`}
          >
            Total pendapatan dari semua sewa aktif bulan ini
          </p>
        </Card>

        {/* Overview Card */}
        <Card
          className={`p-4 sm:p-6 border ${
            isDark
              ? "bg-dark-card border-dark-border"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Overview Sistem
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div
              className={`flex items-center justify-between p-3 rounded-lg ${
                isDark ? "bg-blue-900/20" : "bg-blue-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDark ? "bg-blue-800/30" : "bg-blue-100"
                  }`}
                >
                  <IconUsers isDark={isDark} />
                </div>
                <span
                  className={`text-sm sm:text-base ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Total Sewa
                </span>
              </div>
              <span
                className={`font-bold text-sm sm:text-base ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {dashboardData?.totalSewa ?? 0}
              </span>
            </div>

            <div
              className={`flex items-center justify-between p-3 rounded-lg ${
                isDark ? "bg-purple-900/20" : "bg-purple-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDark ? "bg-purple-800/30" : "bg-purple-100"
                  }`}
                >
                  <IconAdmin isDark={isDark} />
                </div>
                <span
                  className={`text-sm sm:text-base ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Total Admin
                </span>
              </div>
              <span
                className={`font-bold text-sm sm:text-base ${
                  isDark ? "text-purple-400" : "text-purple-600"
                }`}
              >
                {dashboardData?.totalAdmins ?? 0}
              </span>
            </div>

            <div
              className={`flex items-center justify-between p-3 rounded-lg ${
                isDark ? "bg-green-900/20" : "bg-green-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDark ? "bg-green-800/30" : "bg-green-100"
                  }`}
                >
                  <IconUserGroup isDark={isDark} />
                </div>
                <span
                  className={`text-sm sm:text-base ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Total Pengguna
                </span>
              </div>
              <span
                className={`font-bold text-sm sm:text-base ${
                  isDark ? "text-green-400" : "text-green-600"
                }`}
              >
                {dashboardData?.totalUsers ?? 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sewa Terbaru & Motor Perlu Service */}
      <RecentActivity
        sewaTerbaru={dashboardData?.sewaTerbaru || []}
        motorPerluService={dashboardData?.motorPerluService || []}
      />
    </div>
  );
};

// Icons yang digunakan di Dashboard.tsx - dengan support dark theme
interface IconProps {
  isDark?: boolean;
}

const IconMotor: React.FC<IconProps> = ({ isDark }) => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5"
    fill="none"
    stroke={isDark ? "#cbd5e1" : "currentColor"}
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

const IconAvailable: React.FC<IconProps> = ({ isDark }) => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5"
    fill="none"
    stroke={isDark ? "#cbd5e1" : "currentColor"}
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

const IconActive: React.FC<IconProps> = ({ isDark }) => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5"
    fill="none"
    stroke={isDark ? "#cbd5e1" : "currentColor"}
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

const IconWarning: React.FC<IconProps> = ({ isDark }) => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5"
    fill="none"
    stroke={isDark ? "#cbd5e1" : "currentColor"}
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

const IconMoney: React.FC<IconProps> = ({ isDark }) => (
  <svg
    className="w-5 h-5 sm:w-6 sm:h-6"
    fill="none"
    stroke={isDark ? "#10b981" : "currentColor"}
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

const IconUsers: React.FC<IconProps> = ({ isDark }) => (
  <svg
    className="w-5 h-5 sm:w-6 sm:h-6"
    fill="none"
    stroke={isDark ? "#60a5fa" : "currentColor"}
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

const IconAdmin: React.FC<IconProps> = ({ isDark }) => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5"
    fill="none"
    stroke={isDark ? "#a855f7" : "currentColor"}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const IconUserGroup: React.FC<IconProps> = ({ isDark }) => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5"
    fill="none"
    stroke={isDark ? "#10b981" : "currentColor"}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

export default Dashboard;
