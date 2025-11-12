import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sewaService } from "../../services/sewaService";
import { Sewa } from "../../types/sewa";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import Loading from "../../components/ui/Loading";
import { EmptyState } from "../../components/common/EmptyState";
import { DataTable, Column } from "../../components/ui/DataTable";
import { Card } from "../../components/ui/Card";
import Toast from "../../components/ui/Toast";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { useTheme } from "../../hooks/useTheme";

// Settings Icon Component
const SettingsIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.4 15C19.2662 15.3044 19.1929 15.6345 19.2 16C19.2 16.5304 19.4107 17.0391 19.7857 17.4142C20.1608 17.7893 20.6696 18 21.2 18C21.5655 18.0071 21.8956 17.9338 22.2 17.8C22.2 18.9205 21.9686 20.0276 21.5218 21.0512C21.075 22.0748 20.422 22.9941 19.6035 23.7516C18.7851 24.5092 17.8186 25.0894 16.7634 25.4567C15.7083 25.824 14.5863 25.9708 13.466 25.8881C12.3457 25.8054 11.2506 25.4948 10.2453 24.9749C9.23998 24.455 8.34534 23.7365 7.6146 22.8617C6.88385 21.9869 6.33223 20.974 5.99253 19.8839C5.65283 18.7938 5.53214 17.6487 5.63751 16.5128C5.74288 15.3769 6.07213 15.7271 6.606 16.737C7.13987 17.7469 7.86769 18.6416 8.7448 19.3684C9.62191 20.0952 10.6308 20.6389 11.7104 20.968C12.79 21.2971 13.9178 21.4048 15.0344 21.2846C16.151 21.1645 17.2332 20.8191 18.2148 20.2687C19.1964 19.7183 20.0567 18.9742 20.7424 18.0817C21.4282 17.1892 21.9244 16.1674 22.2 15.08"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.4 15C19.2662 14.6956 19.1929 14.3655 19.2 14C19.2 13.4696 19.4107 12.9609 19.7857 12.5858C20.1608 12.2107 20.6696 12 21.2 12C21.5655 11.9929 21.8956 12.0662 22.2 12.2C22.2 11.0795 21.9686 9.9724 21.5218 8.94879C21.075 7.92518 20.422 7.00589 19.6035 6.24834C18.7851 5.49079 17.8186 4.91057 16.7634 4.54330C15.7083 4.17603 14.5863 4.02918 13.466 4.11191C12.3457 4.19464 11.2506 4.50524 10.2453 5.02513C9.23998 5.54502 8.34534 6.26354 7.6146 7.13833C6.88385 8.01312 6.33223 9.02604 5.99253 10.1161C5.65283 11.2062 5.53214 12.3513 5.63751 13.4872C5.74288 14.6231 6.07213 15.7271 6.606 16.737C7.13987 17.7469 7.86769 18.6416 8.7448 19.3684C9.62191 20.0952 10.6308 20.6389 11.7104 20.968C12.79 21.2971 13.9178 21.4048 15.0344 21.2846C16.151 21.1645 17.2332 20.8191 18.2148 20.2687C19.1964 19.7183 20.0567 18.9742 20.7424 18.0817C21.4282 17.1892 21.9244 16.1674 22.2 15.08"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Action Menu Component
const ActionMenu: React.FC<{
  sewa: Sewa;
  onDetail: (sewa: Sewa) => void;
  onSelesai: (sewa: Sewa) => void;
  onEdit: (sewa: Sewa) => void;
  onHapus: (sewa: Sewa) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ sewa, onDetail, onSelesai, onEdit, onHapus, isOpen, onClose }) => {
  const { isDark } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ✅ PERBAIKAN: Gunakan service helper untuk menentukan aksi
  const isLewatTempo = sewaService.isSewaOverdue(sewa);
  const canExtend =
    sewaService.canExtendSewa && sewaService.canExtendSewa(sewa);
  const canComplete = sewaService.canCompleteSewa(sewa);
  const statusInfo = sewaService.getStatusDisplay(sewa);

  console.log("🔍 ActionMenu DEBUG:", {
    sewaId: sewa.id,
    status: sewa.status,
    isLewatTempo,
    canExtend,
    canComplete,
    statusInfo,
  });

  return (
    <div
      ref={menuRef}
      className="absolute right-0 z-50 animate-scale-in origin-top-right"
      style={{ top: "100%", marginTop: "8px" }}
    >
      <div
        className={`border shadow-xl p-2 min-w-[160px] rounded-lg ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        {/* Grid untuk action buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Detail */}
          <button
            onClick={() => onDetail(sewa)}
            className={`flex flex-col items-center justify-center p-3 transition-all duration-200 rounded-lg border hover:scale-105 ${
              isDark
                ? "text-gray-300 hover:bg-gray-700 border-gray-600"
                : "text-gray-700 hover:bg-gray-100 border-gray-300"
            }`}
          >
            <svg
              className="w-5 h-5 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-xs font-medium">Detail</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(sewa)}
            className={`flex flex-col items-center justify-center p-3 transition-all duration-200 rounded-lg border hover:scale-105 ${
              isDark
                ? "text-blue-400 hover:bg-blue-900/20 border-blue-900/30"
                : "text-blue-600 hover:bg-blue-50 border-blue-200"
            }`}
          >
            <svg
              className="w-5 h-5 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="text-xs font-medium">Edit</span>
          </button>

          {/* Selesai - hanya untuk sewa yang bisa diselesaikan */}
          {canComplete && (
            <button
              onClick={() => onSelesai(sewa)}
              className={`flex flex-col items-center justify-center p-3 transition-all duration-200 rounded-lg border hover:scale-105 ${
                isLewatTempo
                  ? isDark
                    ? "text-red-400 hover:bg-red-900/20 border-red-900/30"
                    : "text-red-600 hover:bg-red-50 border-red-200"
                  : isDark
                  ? "text-green-400 hover:bg-green-900/20 border-green-900/30"
                  : "text-green-600 hover:bg-green-50 border-green-200"
              }`}
            >
              <svg
                className="w-5 h-5 mb-1"
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
              <span className="text-xs font-medium">
                {isLewatTempo ? "Selesaikan" : "Selesai"}
              </span>
            </button>
          )}

          {/* Hapus */}
          <button
            onClick={() => onHapus(sewa)}
            className={`flex flex-col items-center justify-center p-3 transition-all duration-200 rounded-lg border hover:scale-105 ${
              isDark
                ? "text-red-400 hover:bg-red-900/20 border-red-900/30"
                : "text-red-600 hover:bg-red-50 border-red-200"
            }`}
          >
            <svg
              className="w-5 h-5 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="text-xs font-medium">Hapus</span>
          </button>
        </div>

        {/* Info tambahan untuk sewa overdue */}
        {isLewatTempo && (
          <div
            className={`mt-2 p-2 rounded border text-center ${
              isDark
                ? "border-red-400 bg-red-900/20 text-red-300"
                : "border-red-300 bg-red-50 text-red-600"
            }`}
          >
            <div className="text-xs font-medium">
              Terlambat: {sewaService.calculateOverdueHours(sewa)} jam
            </div>
            <div className="text-xs">
              Denda: {formatCurrency(sewaService.calculateEstimatedDenda(sewa))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SewaList: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [sewas, setSewas] = useState<Sewa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Modal states
  const [showSelesaiModal, setShowSelesaiModal] = useState(false);
  const [showHapusModal, setShowHapusModal] = useState(false);
  const [selectedSewa, setSelectedSewa] = useState<Sewa | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // State untuk real-time countdown
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadSewas = async () => {
    setIsLoading(true);
    try {
      // ✅ PERBAIKAN: Ambil semua sewa (aktif + lewat tempo + selesai)
      const data = await sewaService.getAll();
      setSewas(data);
      setError(null);

      console.log("🔍 SewaList Loaded:", {
        total: data.length,
        byStatus: data.reduce((acc: any, sewa) => {
          acc[sewa.status] = (acc[sewa.status] || 0) + 1;
          return acc;
        }, {}),
        overdueCount: data.filter((sewa) => sewaService.isSewaOverdue(sewa))
          .length,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memuat data sewa";
      setError(errorMessage);
      console.error("Error loading sewas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSewas();
  }, []);

  // Real-time timer untuk countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update setiap 1 menit

    return () => clearInterval(timer);
  }, []);

  const handleSelesai = async () => {
    if (!selectedSewa) return;

    setActionLoading(true);
    try {
      // ✅ FORMAT TANGGAL YANG BENAR
      const sekarang = new Date();
      const tglSelesai = sekarang.toISOString().slice(0, 16);

      console.log("🕐 Menyelesaikan sewa:", {
        sewaId: selectedSewa.id,
        status: selectedSewa.status,
        isOverdue: sewaService.isSewaOverdue(selectedSewa),
        tglSelesai,
      });

      const result = await sewaService.selesai(selectedSewa.id, {
        tgl_selesai: tglSelesai,
        catatan: "Selesai dari daftar sewa",
      });

      setToast({
        message: result.message || "Sewa berhasil diselesaikan",
        type: "success",
      });
      setShowSelesaiModal(false);
      setSelectedSewa(null);
      await loadSewas();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menyelesaikan sewa";
      setToast({
        message: errorMessage,
        type: "error",
      });
      console.error("Error completing sewa:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleHapus = async () => {
    if (!selectedSewa) return;

    setActionLoading(true);
    try {
      await sewaService.delete(selectedSewa.id);

      setToast({
        message: "Sewa berhasil dihapus",
        type: "success",
      });
      setShowHapusModal(false);
      setSelectedSewa(null);
      await loadSewas();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus sewa";
      setToast({
        message: errorMessage,
        type: "error",
      });
      console.error("Error deleting sewa:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ PERBAIKAN: Helper function untuk menghitung sisa waktu yang real-time
  const calculateRemainingTime = (
    tglKembali: string | Date
  ): {
    text: string;
    isOverdue: boolean;
    hours: number;
    minutes: number;
  } => {
    try {
      const end = new Date(tglKembali);
      const now = currentTime; // Gunakan currentTime state untuk real-time update

      if (isNaN(end.getTime())) {
        return { text: "-", isOverdue: false, hours: 0, minutes: 0 };
      }

      const sisaWaktuMs = end.getTime() - now.getTime();

      // Jika sudah lewat tempo
      if (sisaWaktuMs <= 0) {
        const overdueMs = Math.abs(sisaWaktuMs);
        const hoursOverdue = Math.floor(overdueMs / (1000 * 60 * 60));
        const minutesOverdue = Math.floor(
          (overdueMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        return {
          text: `+${hoursOverdue}j ${minutesOverdue}m`,
          isOverdue: true,
          hours: hoursOverdue,
          minutes: minutesOverdue,
        };
      }

      // Hitung sisa waktu
      const hours = Math.floor(sisaWaktuMs / (1000 * 60 * 60));
      const minutes = Math.floor(
        (sisaWaktuMs % (1000 * 60 * 60)) / (1000 * 60)
      );

      let text = "";
      if (hours > 0) {
        text = `${hours}j ${minutes}m`;
      } else {
        text = `${minutes}m`;
      }

      return {
        text,
        isOverdue: false,
        hours,
        minutes,
      };
    } catch (error) {
      console.error("Error calculating remaining time:", error);
      return { text: "-", isOverdue: false, hours: 0, minutes: 0 };
    }
  };

  // ✅ PERBAIKAN: Helper function untuk mendapatkan status badge
  const getStatusBadge = (sewa: Sewa) => {
    const statusInfo = sewaService.getStatusDisplay(sewa);
    return <Badge variant={statusInfo.variant}>{statusInfo.status}</Badge>;
  };

  // Helper function untuk format date yang aman
  const safeFormatDate = (
    dateValue: string | Date | null | undefined
  ): string => {
    if (!dateValue) return "-";
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? "-" : formatDate(date);
    } catch {
      return "-";
    }
  };

  // ✅ PERBAIKAN: Helper untuk mengecek apakah sewa aktif
  const isSewaAktif = (sewa: Sewa): boolean => {
    return sewa.status === "aktif" || sewa.status === "Lewat Tempo";
  };

  // Event handlers
  const handleRowClick = (sewa: Sewa) => {
    navigate(`/sewas/${sewa.id}`);
  };

  const handleDetail = (sewa: Sewa) => {
    navigate(`/sewas/${sewa.id}`);
    setOpenMenuId(null);
  };

  const handleEdit = (sewa: Sewa) => {
    navigate(`/sewas/${sewa.id}/edit`);
    setOpenMenuId(null);
  };

  const handleSelesaiClick = (sewa: Sewa) => {
    setSelectedSewa(sewa);
    setShowSelesaiModal(true);
    setOpenMenuId(null);
  };

  const handleHapusClick = (sewa: Sewa) => {
    setSelectedSewa(sewa);
    setShowHapusModal(true);
    setOpenMenuId(null);
  };

  // Mencegah event bubbling ketika mengklik action menu
  const handleActionMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Filter sewas berdasarkan search query
  const filteredSewas = sewas.filter(
    (sewa) =>
      (sewa.motor?.plat_nomor || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (sewa.motor?.merk || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (sewa.penyewa?.nama || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (sewa.penyewa?.no_whatsapp || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // ✅ PERBAIKAN: Columns yang menampilkan semua sewa dengan status yang benar
  const columns: Column<Sewa>[] = [
    {
      key: "motor",
      header: "Motor",
      render: (_, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleRowClick(row)}
        >
          <div className="font-medium text-sm">
            {row.motor?.plat_nomor || "-"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {row.motor ? `${row.motor.merk} ${row.motor.model}` : "-"}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "penyewa",
      header: "Penyewa",
      render: (_, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleRowClick(row)}
        >
          <div className="font-medium text-sm">{row.penyewa?.nama || "-"}</div>
          <div className="text-xs text-gray-500 mt-1">
            {row.penyewa?.no_whatsapp || "-"}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "tgl_sewa",
      header: "Tgl Sewa",
      render: (_, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleRowClick(row)}
        >
          <div className="text-sm">{safeFormatDate(row.tgl_sewa)}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "tgl_kembali",
      header: "Tgl Kembali",
      render: (_, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleRowClick(row)}
        >
          <div className="text-sm">{safeFormatDate(row.tgl_kembali)}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "sisa_waktu",
      header: "Sisa Waktu",
      render: (_, row) => {
        // ✅ PERBAIKAN: Hanya tampilkan untuk sewa aktif atau lewat tempo
        const isAktif = isSewaAktif(row);

        if (!isAktif || !row.tgl_kembali) {
          return <div className="text-sm text-gray-500">-</div>;
        }

        const { text, isOverdue } = calculateRemainingTime(row.tgl_kembali);

        return (
          <div
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => handleRowClick(row)}
          >
            <div
              className={`text-sm font-medium ${
                isOverdue ? "text-red-600" : "text-green-600"
              }`}
            >
              {text}
            </div>
            {isOverdue && (
              <div className="text-xs text-red-500 mt-1">Terlambat</div>
            )}
          </div>
        );
      },
    },
    {
      key: "total_harga",
      header: "Total",
      render: (_, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleRowClick(row)}
        >
          <div className="text-sm font-medium">
            {typeof row.total_harga === "number"
              ? formatCurrency(row.total_harga)
              : "-"}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => {
        return (
          <div className="cursor-pointer" onClick={() => handleRowClick(row)}>
            {getStatusBadge(row)}
          </div>
        );
      },
      sortable: true,
    },
    {
      key: "id",
      header: "Aksi",
      render: (_, row) => (
        <div
          className="relative flex justify-center"
          onClick={handleActionMenuClick}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === row.id ? null : row.id);
            }}
            className={`p-2 transition-all duration-200 rounded-lg hover:scale-105 ${
              isDark
                ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            title="Pengaturan"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          <ActionMenu
            sewa={row}
            onDetail={handleDetail}
            onSelesai={handleSelesaiClick}
            onEdit={handleEdit}
            onHapus={handleHapusClick}
            isOpen={openMenuId === row.id}
            onClose={() => setOpenMenuId(null)}
          />
        </div>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="text-center py-8 px-4">
        <p className={`${isDark ? "text-red-400" : "text-red-600"}`}>{error}</p>
        <Button onClick={loadSewas} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Daftar Sewa
          </h1>
          <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Total {filteredSewas.length} sewa
            {sewas.length > 0 && (
              <span className="text-sm">
                {" "}
                ({sewas.filter((s) => sewaService.isSewaOverdue(s)).length}{" "}
                lewat tempo)
              </span>
            )}
          </p>
        </div>
        <Link to="/sewas/create">
          <Button className="w-full sm:w-auto">+ Tambah Sewa</Button>
        </Link>
      </div>

      {/* Data Table */}
      <Card className={isDark ? "bg-gray-800" : ""}>
        {sewas.length === 0 ? (
          <EmptyState
            title="Belum ada sewa"
            description="Tambahkan sewa pertama Anda untuk mulai mengelola rental."
            action={{
              label: "Tambah Sewa",
              onClick: () => navigate("/sewas/create"),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredSewas}
            search={{
              placeholder: "Cari plat motor, merk, nama penyewa...",
              onSearch: setSearchQuery,
            }}
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredSewas.length,
              onPageChange: (page, newSize) => {
                setCurrentPage(page);
                if (newSize) setPageSize(newSize);
              },
            }}
            onRowClick={handleRowClick}
            rowClassName={`cursor-pointer transition-colors ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
            }`}
          />
        )}
      </Card>

      {/* ✅ MODAL SELESAI SEWA */}
      <Modal
        isOpen={showSelesaiModal}
        onClose={() => setShowSelesaiModal(false)}
        title="Selesaikan Sewa"
      >
        <ModalBody>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Apakah Anda yakin ingin menyelesaikan sewa ini?
            {selectedSewa && sewaService.isSewaOverdue(selectedSewa) && (
              <span className="block mt-2 text-red-500 font-medium">
                Sewa ini terlambat! Akan dikenakan denda.
              </span>
            )}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowSelesaiModal(false)}
            disabled={actionLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleSelesai}
            loading={actionLoading}
            variant={
              selectedSewa && sewaService.isSewaOverdue(selectedSewa)
                ? "danger" // ✅ PERBAIKAN: ganti "destructive" dengan "danger"
                : "primary"
            }
          >
            {selectedSewa && sewaService.isSewaOverdue(selectedSewa)
              ? "Selesaikan & Hitung Denda"
              : "Ya, Selesaikan"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ✅ MODAL HAPUS SEWA */}
      <Modal
        isOpen={showHapusModal}
        onClose={() => setShowHapusModal(false)}
        title="Hapus Sewa"
      >
        <ModalBody>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Apakah Anda yakin ingin menghapus sewa ini? Tindakan ini tidak dapat
            dibatalkan.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowHapusModal(false)}
            disabled={actionLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleHapus}
            loading={actionLoading}
            variant="danger" // ✅ PERBAIKAN: ganti "destructive" dengan "danger"
          >
            Ya, Hapus
          </Button>
        </ModalFooter>
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  );
};

export default SewaList;
