// src/pages/dashboard/RecentActivity.tsx
import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "@/utils/formatters";

export interface SewaItem {
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

export interface RecentActivityProps {
  sewaTerbaru: SewaItem[];
  loading?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  sewaTerbaru = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <Card className="p-6 bg-white border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3"
            >
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Sewa Terbaru</h2>
        <Link to="/sewas">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
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
        {sewaTerbaru.length > 0 ? (
          sewaTerbaru.map((sewa) => (
            <div
              key={`sewa-${sewa.id}`}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {sewa.penyewa.nama.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {sewa.penyewa.nama}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {sewa.motor.merk} {sewa.motor.model} •{" "}
                      {sewa.motor.plat_nomor}
                    </p>
                  </div>
                </div>
                <StatusBadge status={sewa.status} className="text-xs" />
              </div>

              <div className="text-right ml-4 flex-shrink-0">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(sewa.total_harga)}
                </p>
                <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                  Kembali: {formatDate(sewa.tgl_kembali)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="Tidak ada sewa aktif"
            description="Belum ada transaksi sewa yang aktif saat ini"
            size="sm"
          />
        )}
      </div>
    </Card>
  );
};

export default RecentActivity;
