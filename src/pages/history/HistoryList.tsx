import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { historyService } from "../../services/historyService";
import { History } from "../../types/history";
import { Button } from "../../components/ui/Button";
import { DataTable, Column } from "../../components/ui/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { useTheme } from "../../hooks/useTheme";
import Loading from "../../components/ui/Loading";
import { EmptyState } from "../../components/common/EmptyState";

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
  history: History;
  onDelete: (history: History) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ history, onDelete, isOpen, onClose }) => {
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
        className={`rm-card border shadow-xl p-2 min-w-[150px] ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="grid grid-cols-1 gap-2">
          {/* Hapus */}
          <button
            onClick={() => onDelete(history)}
            className={`flex items-center space-x-2 p-3 transition-all duration-200 rounded-lg border hover:scale-105 ${
              isDark
                ? "text-red-400 hover:bg-red-900/20 border-red-900/30"
                : "text-red-600 hover:bg-red-50 border-red-100"
            }`}
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="text-sm font-medium">Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryList: React.FC = () => {
  const { isDark } = useTheme();
  const [histories, setHistories] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<History | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const loadHistories = useCallback(
    async (page: number = 1, search: string = "") => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await historyService.getAll(page, pageSize, search);

        const responseData = response?.data || [];
        const paginationData = response?.pagination;

        setHistories(Array.isArray(responseData) ? responseData : []);
        setTotalItems(paginationData?.total || 0);
      } catch (err: unknown) {
        console.error("Error loading histories:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Gagal memuat data riwayat";
        setError(errorMessage);
        setToast({
          message: errorMessage,
          type: "error",
        });

        setHistories([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    loadHistories();
  }, [loadHistories]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    loadHistories(1, query);
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
      loadHistories(1, searchQuery);
    } else {
      setCurrentPage(page);
      loadHistories(page, searchQuery);
    }
  };

  const handleDeleteClick = (history: History) => {
    setSelectedHistory(history);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = async () => {
    if (!selectedHistory) return;

    setActionLoading(true);
    try {
      await historyService.delete(selectedHistory.id);
      setToast({
        message: "Riwayat berhasil dihapus",
        type: "success",
      });
      setShowDeleteModal(false);
      setSelectedHistory(null);
      loadHistories(currentPage, searchQuery);
    } catch (err: unknown) {
      console.error("Error deleting history:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus riwayat";
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "Tepat Waktu" ? (
      <Badge variant="success">Tepat Waktu</Badge>
    ) : (
      <Badge variant="danger">Terlambat</Badge>
    );
  };

  const handleActionMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const totalHistories = totalItems;
  const tepatWaktuCount = Array.isArray(histories)
    ? histories.filter((h) => h.status_selesai === "Tepat Waktu").length
    : 0;

  const terlambatCount = Array.isArray(histories)
    ? histories.filter((h) => h.status_selesai === "Terlambat").length
    : 0;

  const totalPendapatan = Array.isArray(histories)
    ? histories.reduce((sum, h) => sum + (h.harga ?? 0) + (h.denda ?? 0), 0)
    : 0;

  // ✅ FIXED: Semua teks sekarang support dark mode
  const columns: Column<History>[] = [
    {
      key: "motor_plat",
      header: "Plat Motor",
      render: (_, row) => (
        <Link
          to={`/histories/${row.id}`}
          className={`font-medium transition-colors ${
            isDark
              ? "text-blue-400 hover:text-blue-300"
              : "text-blue-600 hover:text-blue-800"
          } hover:underline`}
        >
          {row.motor_plat || "-"}
        </Link>
      ),
      sortable: true,
    },
    {
      key: "motor_merk",
      header: "Merk & Model",
      render: (_, row) => (
        <Link
          to={`/histories/${row.id}`}
          className={`transition-colors ${
            isDark
              ? "text-dark-secondary hover:text-blue-400"
              : "text-gray-700 hover:text-blue-600"
          }`}
        >
          {`${row.motor_merk || ""} ${row.motor_model || ""}`.trim() || "-"}
        </Link>
      ),
      sortable: true,
    },
    {
      key: "penyewa_nama",
      header: "Penyewa",
      render: (_, row) => (
        <Link
          to={`/histories/${row.id}`}
          className={`transition-colors ${
            isDark
              ? "text-dark-secondary hover:text-blue-400"
              : "text-gray-700 hover:text-blue-600"
          }`}
        >
          {row.penyewa_nama || "-"}
        </Link>
      ),
      sortable: true,
    },
    {
      key: "penyewa_whatsapp",
      header: "WhatsApp",
      render: (_, row) => (
        <Link
          to={`/histories/${row.id}`}
          className={`transition-colors ${
            isDark
              ? "text-dark-secondary hover:text-blue-400"
              : "text-gray-700 hover:text-blue-600"
          }`}
        >
          {row.penyewa_whatsapp || "-"}
        </Link>
      ),
    },
    {
      key: "tgl_selesai",
      header: "Tanggal Selesai",
      render: (value, row) => (
        <Link
          to={`/histories/${row.id}`}
          className={`transition-colors ${
            isDark
              ? "text-dark-secondary hover:text-blue-400"
              : "text-gray-700 hover:text-blue-600"
          }`}
        >
          {value ? formatDate(value as string) : "-"}
        </Link>
      ),
      sortable: true,
    },
    {
      key: "status_selesai",
      header: "Status",
      render: (value, row) => (
        <Link to={`/histories/${row.id}`} className="inline-block">
          {getStatusBadge(value as string)}
        </Link>
      ),
      sortable: true,
    },
    {
      key: "harga",
      header: "Harga Sewa",
      render: (value, row) => (
        <Link
          to={`/histories/${row.id}`}
          className={`transition-colors ${
            isDark
              ? "text-dark-secondary hover:text-blue-400"
              : "text-gray-700 hover:text-blue-600"
          }`}
        >
          {formatCurrency(value as number)}
        </Link>
      ),
      sortable: true,
    },
    {
      key: "denda",
      header: "Denda",
      render: (value, row) => (
        <Link
          to={`/histories/${row.id}`}
          className={`transition-colors ${
            isDark
              ? "text-dark-secondary hover:text-blue-400"
              : "text-gray-700 hover:text-blue-600"
          }`}
        >
          {formatCurrency(value as number)}
        </Link>
      ),
      sortable: true,
    },
    {
      key: "total",
      header: "Total",
      render: (_, row) => (
        <Link
          to={`/histories/${row.id}`}
          className={`font-medium transition-colors ${
            isDark
              ? "text-dark-primary hover:text-blue-400"
              : "text-gray-900 hover:text-blue-600"
          }`}
        >
          {formatCurrency((row.harga ?? 0) + (row.denda ?? 0))}
        </Link>
      ),
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
            history={row}
            onDelete={handleDeleteClick}
            isOpen={openMenuId === row.id}
            onClose={() => setOpenMenuId(null)}
          />
        </div>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  if (error && histories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Riwayat Sewa
            </h1>
          </div>
        </div>

        <Card>
          <div className="text-center py-8">
            <div
              className={`text-6xl mb-4 ${
                isDark ? "text-red-400" : "text-red-600"
              }`}
            >
              ⚠️
            </div>
            <h2
              className={`text-xl font-bold mb-2 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Gagal Memuat Data
            </h2>
            <p
              className={`mb-4 ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              {error}
            </p>
            <Button onClick={() => loadHistories()}>Coba Lagi</Button>
          </div>
        </Card>
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
            Riwayat Sewa
          </h1>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            Total {totalHistories} riwayat sewa
          </p>
        </div>
      </div>

      {/* Statistics Summary - ✅ FIXED: Text colors untuk dark mode */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className={`rm-card p-4 ${
            isDark
              ? "bg-blue-900/20 border-blue-800/30"
              : "bg-blue-50 border-blue-200"
          } border`}
        >
          <h3
            className={`text-lg font-semibold ${
              isDark ? "text-blue-300" : "text-blue-800"
            }`}
          >
            {totalHistories}
          </h3>
          <p className={isDark ? "text-blue-400" : "text-blue-600"}>
            Total Riwayat
          </p>
        </div>

        <div
          className={`rm-card p-4 ${
            isDark
              ? "bg-green-900/20 border-green-800/30"
              : "bg-green-50 border-green-200"
          } border`}
        >
          <h3
            className={`text-lg font-semibold ${
              isDark ? "text-green-300" : "text-green-800"
            }`}
          >
            {tepatWaktuCount}
          </h3>
          <p className={isDark ? "text-green-400" : "text-green-600"}>
            Tepat Waktu
          </p>
        </div>

        <div
          className={`rm-card p-4 ${
            isDark
              ? "bg-red-900/20 border-red-800/30"
              : "bg-red-50 border-red-200"
          } border`}
        >
          <h3
            className={`text-lg font-semibold ${
              isDark ? "text-red-300" : "text-red-800"
            }`}
          >
            {terlambatCount}
          </h3>
          <p className={isDark ? "text-red-400" : "text-red-600"}>Terlambat</p>
        </div>

        <div
          className={`rm-card p-4 ${
            isDark
              ? "bg-purple-900/20 border-purple-800/30"
              : "bg-purple-50 border-purple-200"
          } border`}
        >
          <h3
            className={`text-lg font-semibold ${
              isDark ? "text-purple-300" : "text-purple-800"
            }`}
          >
            {formatCurrency(totalPendapatan)}
          </h3>
          <p className={isDark ? "text-purple-400" : "text-purple-600"}>
            Total Pendapatan
          </p>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        {histories.length === 0 && !isLoading ? (
          <EmptyState
            title="Belum ada riwayat sewa"
            description="Riwayat sewa akan muncul di sini setelah sewa diselesaikan."
          />
        ) : (
          <DataTable<History>
            columns={columns}
            data={histories}
            isLoading={isLoading}
            search={{
              placeholder: "Cari plat nomor, nama penyewa, atau status...",
              onSearch: handleSearch,
            }}
            pagination={{
              currentPage,
              pageSize,
              totalItems: totalItems,
              onPageChange: handlePageChange,
            }}
          />
        )}
      </Card>

      {/* Delete Confirmation Modal - ✅ FIXED: Text colors untuk dark mode */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus Riwayat"
        size="sm"
      >
        <ModalBody>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            Apakah Anda yakin ingin menghapus riwayat sewa ini?
          </p>
          {selectedHistory && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${
                isDark
                  ? "bg-dark-secondary/30 border-dark-border text-dark-muted"
                  : "bg-red-50 border-red-200 text-red-700"
              } border`}
            >
              <p
                className={`font-medium ${
                  isDark ? "text-dark-primary" : "text-red-800"
                }`}
              >
                Data yang akan dihapus:
              </p>
              <ul className="mt-1 space-y-1">
                <li className={isDark ? "text-dark-secondary" : "text-red-700"}>
                  • Motor: {selectedHistory.motor_merk}{" "}
                  {selectedHistory.motor_model} ({selectedHistory.motor_plat})
                </li>
                <li className={isDark ? "text-dark-secondary" : "text-red-700"}>
                  • Penyewa: {selectedHistory.penyewa_nama}
                </li>
                <li className={isDark ? "text-dark-secondary" : "text-red-700"}>
                  • WhatsApp: {selectedHistory.penyewa_whatsapp}
                </li>
                <li className={isDark ? "text-dark-secondary" : "text-red-700"}>
                  • Tanggal: {formatDate(selectedHistory.tgl_selesai)}
                </li>
                <li className={isDark ? "text-dark-secondary" : "text-red-700"}>
                  • Total:{" "}
                  {formatCurrency(
                    (selectedHistory.harga ?? 0) + (selectedHistory.denda ?? 0)
                  )}
                </li>
              </ul>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={actionLoading}
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

export default HistoryList;
