import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

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

interface MotorPerluService {
  id: number;
  plat_nomor: string;
  merk: string;
  model: string;
  status: string;
}

interface RecentActivityProps {
  sewaTerbaru: SewaTerbaru[];
  motorPerluService: MotorPerluService[];
}

type BadgeVariant =
  | "success"
  | "danger"
  | "secondary"
  | "primary"
  | "warning"
  | "info";

const RecentActivity: React.FC<RecentActivityProps> = ({
  sewaTerbaru,
  motorPerluService,
}) => {
  const { isDark } = useTheme();

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
      case "Perlu Service":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* === SEWA TERBARU === */}
      <Card
        className={`rm-card p-6 ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className={`text-xl font-semibold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Sewa Terbaru
            </h2>
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              5 transaksi sewa terbaru
            </p>
          </div>
          <Link to="/sewas">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center space-x-2 text-sm ${
                isDark
                  ? "border-dark-border text-dark-secondary hover:bg-dark-hover"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
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
          {sewaTerbaru?.length ? (
            sewaTerbaru.slice(0, 5).map((sewa) => (
              <div
                key={`sewa-${sewa.id}`}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isDark
                    ? "bg-dark-secondary border-dark-border hover:bg-dark-hover"
                    : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                      isDark ? "bg-blue-900/40" : "bg-blue-100"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                      <span
                        className={`font-semibold truncate text-base ${
                          isDark ? "text-dark-primary" : "text-gray-900"
                        }`}
                      >
                        {sewa.penyewa.nama}
                      </span>
                      <Badge
                        variant={getStatusBadgeVariant(sewa.status)}
                        className="mt-1 sm:mt-0 self-start sm:self-auto"
                      >
                        {sewa.status}
                      </Badge>
                    </div>
                    <p
                      className={`text-sm truncate ${
                        isDark ? "text-dark-secondary" : "text-gray-600"
                      }`}
                    >
                      {sewa.motor.merk} {sewa.motor.model} •{" "}
                      {sewa.motor.plat_nomor}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isDark ? "text-dark-muted" : "text-gray-500"
                      }`}
                    >
                      Kembali: {formatDate(sewa.tgl_kembali)}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p
                    className={`text-sm font-semibold whitespace-nowrap ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {formatCurrency(sewa.total_harga)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <svg
                className={`w-16 h-16 mx-auto mb-4 ${
                  isDark ? "text-dark-border" : "text-gray-300"
                }`}
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
              <p className={isDark ? "text-dark-muted" : "text-gray-500"}>
                Tidak ada sewa aktif
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* === MOTOR PERLU SERVICE === */}
      <Card
        className={`rm-card p-6 ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className={`text-xl font-semibold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Motor Perlu Service
            </h2>
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              Motor yang memerlukan perawatan
            </p>
          </div>
          <Link to="/motors">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center space-x-2 text-sm ${
                isDark
                  ? "border-dark-border text-dark-secondary hover:bg-dark-hover"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
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
          {motorPerluService?.length ? (
            motorPerluService.map((motor) => (
              <div
                key={`motor-${motor.id}`}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isDark
                    ? "bg-orange-900/20 border-orange-700 hover:bg-orange-800/30"
                    : "bg-orange-50 border-orange-100 hover:bg-orange-100"
                }`}
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                      isDark ? "bg-orange-900/40" : "bg-orange-100"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        isDark ? "text-orange-400" : "text-orange-600"
                      }`}
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
                    <h4
                      className={`font-semibold truncate text-base ${
                        isDark ? "text-dark-primary" : "text-gray-900"
                      }`}
                    >
                      {motor.merk} {motor.model}
                    </h4>
                    <p
                      className={`text-sm mt-1 ${
                        isDark ? "text-dark-secondary" : "text-gray-600"
                      }`}
                    >
                      {motor.plat_nomor}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="warning"
                  className={`whitespace-nowrap text-sm ${
                    isDark
                      ? "bg-orange-900/40 text-orange-300 border-orange-700"
                      : "bg-orange-100 text-orange-700 border-orange-200"
                  }`}
                >
                  Perlu Service
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <svg
                className={`w-16 h-16 mx-auto mb-4 ${
                  isDark ? "text-green-700" : "text-green-300"
                }`}
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
              <p className={isDark ? "text-dark-muted" : "text-gray-500"}>
                Semua motor dalam kondisi baik
              </p>
              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-dark-muted" : "text-gray-400"
                }`}
              >
                Tidak ada motor yang perlu service
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RecentActivity;
