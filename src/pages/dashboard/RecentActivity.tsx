// src/pages/dashboard/RecentActivity.tsx
import React from "react";
import { Card } from "@/components/ui/Card";
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

interface RecentActivityProps {
  sewaTerbaru: SewaTerbaru[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ sewaTerbaru }) => {
  const { isDark } = useTheme();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif":
        return isDark
          ? "bg-green-900/30 text-green-300"
          : "bg-green-100 text-green-800";
      case "Lewat Tempo":
        return isDark
          ? "bg-red-900/30 text-red-300"
          : "bg-red-100 text-red-800";
      default:
        return isDark
          ? "bg-gray-700 text-gray-300"
          : "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card
      className={`p-4 sm:p-6 border ${
        isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-200"
      }`}
    >
      <h2
        className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${
          isDark ? "text-dark-primary" : "text-gray-900"
        }`}
      >
        Sewa Terbaru
      </h2>

      {sewaTerbaru.length === 0 ? (
        <div
          className={`text-center py-8 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <svg
            className="mx-auto h-12 w-12 mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p>Tidak ada sewa aktif saat ini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sewaTerbaru.map((sewa) => (
            <div
              key={sewa.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                isDark
                  ? "bg-dark-hover border-dark-border"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div
                  className={`p-2 rounded-lg ${
                    isDark ? "bg-blue-900/30" : "bg-blue-100"
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-dark-primary" : "text-gray-900"
                      }`}
                    >
                      {sewa.penyewa.nama}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        sewa.status
                      )}`}
                    >
                      {sewa.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{sewa.motor.plat_nomor}</span>
                    <span>•</span>
                    <span>
                      {sewa.motor.merk} {sewa.motor.model}
                    </span>
                    <span>•</span>
                    <span>{formatDate(sewa.tgl_sewa)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {formatCurrency(sewa.total_harga)}
                </p>
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Kembali: {formatDate(sewa.tgl_kembali)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentActivity;
