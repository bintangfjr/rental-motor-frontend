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

// Action Menu Component dengan layout grid 2x2
const ActionMenu: React.FC<{
  sewa: Sewa;
  onDetail: (sewa: Sewa) => void;
  onSelesai: (sewa: Sewa) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ sewa, onDetail, onSelesai, isOpen, onClose }) => {
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

  return (
    <div
      ref={menuRef}
      className="absolute right-0 z-50 animate-scale-in origin-top-right"
      style={{ top: "100%", marginTop: "8px" }}
    >
      <div
        className={`rm-card border shadow-xl p-2 min-w-[200px] ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Grid 2x2 untuk action buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Detail - Kiri Bawah */}
          <button
            onClick={() => onDetail(sewa)}
            className={`flex flex-col items-center justify-center p-3 transition-all duration-200 rounded-lg border hover:scale-105 ${
              isDark
                ? "text-dark-secondary hover:bg-dark-hover border-dark-border"
                : "text-gray-700 hover:bg-gray-50 border-gray-100"
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

          {/* Selesai - Kanan Bawah */}
          {sewa.status === "aktif" && (
            <button
              onClick={() => onSelesai(sewa)}
              className={`flex flex-col items-center justify-center p-3 transition-all duration-200 rounded-lg border hover:scale-105 ${
                isDark
                  ? "text-green-400 hover:bg-green-900/20 border-green-900/30"
                  : "text-green-600 hover:bg-green-50 border-green-100"
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
              <span className="text-xs font-medium">Selesai</span>
            </button>
          )}

          {/* Placeholder untuk sewa yang sudah selesai/dibatalkan */}
          {sewa.status !== "aktif" && (
            <div
              className={`flex flex-col items-center justify-center p-3 rounded-lg border opacity-50 ${
                isDark
                  ? "text-dark-muted border-dark-border"
                  : "text-gray-400 border-gray-100"
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
              <span className="text-xs">Selesai</span>
            </div>
          )}
        </div>
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
  const [selectedSewa, setSelectedSewa] = useState<Sewa | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadSewas = async () => {
    setIsLoading(true);
    try {
      const data = await sewaService.getAll();
      setSewas(data);
      setError(null);
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

  const handleSelesai = async () => {
    if (!selectedSewa) return;

    setActionLoading(true);
    try {
      await sewaService.selesai(selectedSewa.id, {
        tgl_selesai: new Date().toISOString(),
        catatan: "Selesai dari daftar sewa",
      });
      setToast({
        message: "Sewa berhasil diselesaikan",
        type: "success",
      });
      setShowSelesaiModal(false);
      setSelectedSewa(null);
      await loadSewas(); // Reload data untuk update status
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

  // Helper function untuk menghitung sisa waktu
  const calculateRemainingTime = (tglKembali: string | Date): string => {
    try {
      const end =
        tglKembali instanceof Date ? tglKembali : new Date(tglKembali);
      const now = new Date();

      if (isNaN(end.getTime())) return "-";

      const sisaWaktuMs = end.getTime() - now.getTime();

      // Jika sudah lewat tempo
      if (sisaWaktuMs <= 0) {
        const overdueMs = Math.abs(sisaWaktuMs);
        const daysOverdue = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
        const hoursOverdue = Math.floor(
          (overdueMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );

        if (daysOverdue > 0) {
          return `+${daysOverdue}h ${hoursOverdue}j`;
        }
        return `+${hoursOverdue}j`;
      }

      // Hitung sisa waktu
      const days = Math.floor(sisaWaktuMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (sisaWaktuMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (sisaWaktuMs % (1000 * 60 * 60)) / (1000 * 60)
      );

      if (days > 0) {
        return `${days}h ${hours}j`;
      } else if (hours > 0) {
        return `${hours}j ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      console.error("Error calculating remaining time:", error);
      return "-";
    }
  };

  // Helper function untuk mendapatkan status badge
  const getStatusBadge = (status: string, tglKembali: string | Date) => {
    if (status === "selesai") {
      return <Badge variant="success">Selesai</Badge>;
    }
    if (status === "dibatalkan") {
      return <Badge variant="secondary">Dibatalkan</Badge>;
    }

    // Untuk status aktif, cek apakah lewat tempo
    try {
      const end =
        tglKembali instanceof Date ? tglKembali : new Date(tglKembali);
      const now = new Date();
      if (end < now) {
        return <Badge variant="danger">Lewat Tempo</Badge>;
      }
      return <Badge variant="warning">Aktif</Badge>;
    } catch {
      return <Badge variant="warning">Aktif</Badge>;
    }
  };

  // Helper function untuk format date yang aman
  const safeFormatDate = (
    dateValue: string | Date | null | undefined
  ): string => {
    if (!dateValue) return "-";
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return isNaN(date.getTime()) ? "-" : formatDate(date);
    } catch {
      return "-";
    }
  };

  // ✅ FIXED: Handle row click dengan parameter yang benar
  const handleRowClick = (sewa: Sewa) => {
    navigate(`/sewas/${sewa.id}`);
  };

  const handleDetail = (sewa: Sewa) => {
    navigate(`/sewas/${sewa.id}`);
    setOpenMenuId(null);
  };

  const handleSelesaiClick = (sewa: Sewa) => {
    setSelectedSewa(sewa);
    setShowSelesaiModal(true);
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
        .includes(searchQuery.toLowerCase())
  );

  // ✅ FIXED: Columns yang lebih sederhana dan aman
  const columns: Column<Sewa>[] = [
    {
      key: "motor",
      header: "Motor",
      render: (_, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleRowClick(row)}
        >
          {row.motor
            ? `${row.motor.merk} ${row.motor.model} (${row.motor.plat_nomor})`
            : "-"}
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
          {row.penyewa?.nama ?? "-"}
        </div>
      ),
      sortable: true,
    },
    {
      key: "tgl_sewa",
      header: "Tanggal Sewa",
      render: (_, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleRowClick(row)}
        >
          {safeFormatDate(row.tgl_sewa)}
        </div>
      ),
      sortable: true,
    },
    {
      key: "sisa_waktu",
      header: "Sisa Waktu",
      render: (_, row) => {
        if (row.status !== "aktif" || !row.tgl_kembali) {
          return "-";
        }
        return (
          <div
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => handleRowClick(row)}
          >
            {calculateRemainingTime(row.tgl_kembali)}
          </div>
        );
      },
    },
    {
      key: "total_harga",
      header: "Total Harga",
      render: (_, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleRowClick(row)}
        >
          {typeof row.total_harga === "number"
            ? formatCurrency(row.total_harga)
            : "-"}
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => {
        if (!row.status || !row.tgl_kembali) return "-";
        return (
          <div className="cursor-pointer" onClick={() => handleRowClick(row)}>
            {getStatusBadge(row.status, row.tgl_kembali)}
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
            className={`p-2 transition-colors rounded-lg hover:scale-105 ${
              isDark
                ? "text-dark-secondary hover:text-dark-primary hover:bg-dark-hover"
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
      <div className="text-center py-8">
        <p className={`${isDark ? "text-red-400" : "text-red-600"}`}>{error}</p>
        <Button onClick={loadSewas} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Daftar Sewa Aktif
          </h1>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            Total {filteredSewas.length} sewa aktif
          </p>
        </div>
        <Link to="/sewas/create">
          <Button>+ Tambah Sewa</Button>
        </Link>
      </div>

      <Card>
        {sewas.length === 0 ? (
          <EmptyState
            title="Belum ada sewa aktif"
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
              placeholder: "Cari motor, penyewa...",
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
            rowClassName={`cursor-pointer transition-all duration-200 ${
              isDark ? "hover:bg-dark-hover/50" : "hover:bg-gray-50"
            }`}
          />
        )}
      </Card>

      {/* Selesai Confirmation Modal */}
      <Modal
        isOpen={showSelesaiModal}
        onClose={() => setShowSelesaiModal(false)}
        title="Konfirmasi Selesai Sewa"
        size="sm"
      >
        <ModalBody>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            Apakah Anda yakin ingin menyelesaikan sewa{" "}
            <span
              className={`font-semibold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              {selectedSewa?.motor?.plat_nomor} - {selectedSewa?.motor?.merk}
            </span>{" "}
            oleh{" "}
            <span
              className={`font-semibold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              {selectedSewa?.penyewa?.nama}
            </span>
            ?
          </p>
          {selectedSewa && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${
                isDark
                  ? "bg-dark-secondary/30 text-dark-muted"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              <p className="font-medium">Sewa akan ditandai sebagai selesai.</p>
              <p className="mt-1">Motor akan kembali tersedia untuk disewa.</p>
            </div>
          )}
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
            variant="success"
            onClick={handleSelesai}
            isLoading={actionLoading}
          >
            Ya, Selesaikan
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
