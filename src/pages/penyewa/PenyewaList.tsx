import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { penyewaService } from "../../services/penyewaService";
import { Penyewa } from "../../types/penyewa";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import Loading from "../../components/ui/Loading";
import { EmptyState } from "../../components/common/EmptyState";
import { DataTable, Column } from "../../components/ui/DataTable";
import { Card } from "../../components/ui/Card";
import Toast from "../../components/ui/Toast";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
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
  penyewa: Penyewa;
  onDetail: (penyewa: Penyewa) => void;
  onEdit: (penyewa: Penyewa) => void;
  onToggleBlacklist: (penyewa: Penyewa) => void;
  onDelete: (penyewa: Penyewa) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({
  penyewa,
  onDetail,
  onEdit,
  onToggleBlacklist,
  onDelete,
  isOpen,
  onClose,
}) => {
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
      style={{ top: "100%", marginTop: "4px" }}
    >
      <div
        className={`rm-card border shadow-xl p-2 min-w-[140px] sm:min-w-[280px] ${
          isDark
            ? "bg-dark-card/95 backdrop-blur-md border-dark-border/50"
            : "bg-white/95 backdrop-blur-md border-white/20 shadow-2xl"
        }`}
      >
        {/* Grid 2x2 untuk action buttons */}
        <div className="grid grid-cols-2 gap-1 sm:gap-2">
          {/* Detail */}
          <button
            onClick={() => onDetail(penyewa)}
            className={`flex flex-col items-center justify-center p-2 sm:p-3 transition-all duration-200 rounded-lg border hover:scale-105 active:scale-95 ${
              isDark
                ? "text-dark-secondary hover:bg-dark-hover border-dark-border/50"
                : "text-gray-700 hover:bg-white/80 border-white/30 bg-white/50 backdrop-blur-sm"
            }`}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mb-1"
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
            onClick={() => onEdit(penyewa)}
            className={`flex flex-col items-center justify-center p-2 sm:p-3 transition-all duration-200 rounded-lg border hover:scale-105 active:scale-95 ${
              isDark
                ? "text-dark-secondary hover:bg-dark-hover border-dark-border/50"
                : "text-gray-700 hover:bg-white/80 border-white/30 bg-white/50 backdrop-blur-sm"
            }`}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mb-1"
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

          {/* Blacklist */}
          <button
            onClick={() => onToggleBlacklist(penyewa)}
            className={`flex flex-col items-center justify-center p-2 sm:p-3 transition-all duration-200 rounded-lg border hover:scale-105 active:scale-95 ${
              penyewa.is_blacklisted
                ? isDark
                  ? "text-green-400 hover:bg-green-900/20 border-green-900/30"
                  : "text-green-600 hover:bg-green-50/80 border-green-100 bg-green-50/50 backdrop-blur-sm"
                : isDark
                ? "text-yellow-400 hover:bg-yellow-900/20 border-yellow-900/30"
                : "text-yellow-600 hover:bg-yellow-50/80 border-yellow-100 bg-yellow-50/50 backdrop-blur-sm"
            }`}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {penyewa.is_blacklisted ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              )}
            </svg>
            <span className="text-xs font-medium text-center">
              {penyewa.is_blacklisted ? "Buka" : "Blacklist"}
            </span>
          </button>

          {/* Hapus */}
          <button
            onClick={() => onDelete(penyewa)}
            className={`flex flex-col items-center justify-center p-2 sm:p-3 transition-all duration-200 rounded-lg border hover:scale-105 active:scale-95 ${
              isDark
                ? "text-red-400 hover:bg-red-900/20 border-red-900/30"
                : "text-red-600 hover:bg-red-50/80 border-red-100 bg-red-50/50 backdrop-blur-sm"
            }`}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mb-1"
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
      </div>
    </div>
  );
};

const PenyewaList: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [penyewas, setPenyewas] = useState<Penyewa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [selectedPenyewa, setSelectedPenyewa] = useState<Penyewa | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPenyewas = async () => {
    setIsLoading(true);
    try {
      const data = await penyewaService.getAll();
      setPenyewas(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memuat data penyewa";
      setError(errorMessage);
      console.error("Error loading penyewas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPenyewas();
  }, []);

  const handleToggleBlacklist = async () => {
    if (!selectedPenyewa) return;

    setActionLoading(true);
    try {
      const updatedPenyewa = await penyewaService.toggleBlacklist(
        selectedPenyewa.id
      );
      setPenyewas(
        penyewas.map((p) => (p.id === selectedPenyewa.id ? updatedPenyewa : p))
      );
      setToast({
        message: `Penyewa ${
          updatedPenyewa.is_blacklisted ? "ditambahkan ke" : "dihapus dari"
        } blacklist`,
        type: "success",
      });
      setShowBlacklistModal(false);
      setSelectedPenyewa(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal mengubah status blacklist";
      setToast({
        message: errorMessage,
        type: "error",
      });
      console.error("Error toggling blacklist:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPenyewa) return;

    setActionLoading(true);
    try {
      await penyewaService.delete(selectedPenyewa.id);
      setPenyewas(penyewas.filter((p) => p.id !== selectedPenyewa.id));
      setToast({
        message: "Penyewa berhasil dihapus",
        type: "success",
      });
      setShowDeleteModal(false);
      setSelectedPenyewa(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus penyewa";
      setToast({
        message: errorMessage,
        type: "error",
      });
      console.error("Error deleting penyewa:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRowClick = (penyewa: Penyewa) => {
    navigate(`/penyewas/${penyewa.id}`);
  };

  const handleDetail = (penyewa: Penyewa) => {
    navigate(`/penyewas/${penyewa.id}`);
    setOpenMenuId(null);
  };

  const handleEdit = (penyewa: Penyewa) => {
    navigate(`/penyewas/${penyewa.id}/edit`);
    setOpenMenuId(null);
  };

  const handleBlacklistClick = (penyewa: Penyewa) => {
    setSelectedPenyewa(penyewa);
    setShowBlacklistModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (penyewa: Penyewa) => {
    setSelectedPenyewa(penyewa);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  // Mencegah event bubbling ketika mengklik action menu
  const handleActionMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getStatusBadge = (isBlacklisted: boolean) => {
    return isBlacklisted ? (
      <Badge variant="danger" className="text-xs px-2 py-1">
        Blacklist
      </Badge>
    ) : (
      <Badge variant="success" className="text-xs px-2 py-1">
        Aktif
      </Badge>
    );
  };

  // Filter penyewas berdasarkan search query
  const filteredPenyewas = penyewas.filter(
    (penyewa) =>
      penyewa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      penyewa.no_whatsapp.includes(searchQuery) ||
      (penyewa.alamat &&
        penyewa.alamat.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns: Column<Penyewa>[] = [
    {
      key: "nama",
      header: "Nama Penyewa",
      sortable: true,
      render: (value, row) => (
        <div
          className="cursor-pointer hover:text-blue-600 transition-colors duration-200 group"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
        >
          <div className="font-medium text-sm sm:text-base group-hover:translate-x-1 transition-transform">
            {value}
          </div>
          {row.alamat && (
            <div
              className={`text-xs mt-1 truncate max-w-[200px] ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              {row.alamat}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "is_blacklisted",
      header: "Status",
      render: (_, row) => (
        <div
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
        >
          {getStatusBadge(row.is_blacklisted)}
        </div>
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
            className={`p-2 transition-all duration-200 rounded-lg hover:scale-110 active:scale-95 ${
              isDark
                ? "text-dark-secondary hover:text-dark-primary hover:bg-dark-hover/80 backdrop-blur-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/80 backdrop-blur-sm border border-transparent hover:border-white/30 shadow-sm hover:shadow-md"
            }`}
            title="Pengaturan"
          >
            <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <ActionMenu
            penyewa={row}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onToggleBlacklist={handleBlacklistClick}
            onDelete={handleDeleteClick}
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div
            className={`p-4 rounded-lg mb-4 ${
              isDark ? "bg-red-900/20 text-red-300" : "bg-red-100 text-red-600"
            }`}
          >
            <p className="text-sm sm:text-base">{error}</p>
          </div>
          <Button
            onClick={loadPenyewas}
            className="w-full sm:w-auto"
            variant={isDark ? "outline" : "default"}
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4 px-3 sm:px-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-center sm:text-left">
          <h1
            className={`text-xl sm:text-2xl font-bold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Daftar Penyewa
          </h1>
          <p
            className={`mt-1 text-sm ${
              isDark ? "text-dark-secondary" : "text-gray-600"
            }`}
          >
            Total {filteredPenyewas.length} penyewa
          </p>
        </div>
        <Link
          to="/penyewas/create"
          className="flex justify-center sm:justify-start"
        >
          <Button className="w-full sm:w-auto px-4 py-2" size="sm">
            + Tambah Penyewa
          </Button>
        </Link>
      </div>

      {/* Data Table Card */}
      <Card
        className={`transition-all duration-300 ${
          isDark
            ? "bg-dark-card/80 backdrop-blur-md border-dark-border/50"
            : "bg-white/80 backdrop-blur-md border-white/20 shadow-xl"
        }`}
      >
        {penyewas.length === 0 ? (
          <EmptyState
            title="Belum ada penyewa"
            description="Tambahkan penyewa pertama Anda untuk mulai mengelola rental."
            action={{
              label: "Tambah Penyewa",
              onClick: () => navigate("/penyewas/create"),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredPenyewas}
            search={{
              placeholder: "Cari nama atau alamat...",
              onSearch: setSearchQuery,
            }}
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredPenyewas.length,
              onPageChange: (page, newSize) => {
                setCurrentPage(page);
                if (newSize) setPageSize(newSize);
              },
            }}
            onRowClick={handleRowClick}
            rowClassName={`cursor-pointer transition-all duration-200 border-b ${
              isDark
                ? "hover:bg-dark-hover/50 border-dark-border/30"
                : "hover:bg-white/60 backdrop-blur-sm border-gray-100"
            }`}
            className={isDark ? "" : "bg-transparent"}
            headerClassName={isDark ? "bg-dark-card/50" : "bg-white/50"}
          />
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus Penyewa"
        size="sm"
      >
        <ModalBody>
          <p
            className={`${
              isDark ? "text-dark-secondary" : "text-gray-600"
            } text-sm`}
          >
            Apakah Anda yakin ingin menghapus penyewa{" "}
            <span
              className={`font-semibold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              {selectedPenyewa?.nama}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>
          {selectedPenyewa && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${
                isDark
                  ? "bg-dark-secondary/30 text-dark-muted"
                  : "bg-red-50/80 backdrop-blur-sm text-red-700 border border-red-100"
              }`}
            >
              <p className="font-medium">
                Semua data penyewa akan dihapus permanen!
              </p>
              <p className="mt-1">
                Termasuk foto KTP dan riwayat sewa terkait.
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={actionLoading}
              className="flex-1"
            >
              Ya, Hapus
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Blacklist Confirmation Modal */}
      <Modal
        isOpen={showBlacklistModal}
        onClose={() => setShowBlacklistModal(false)}
        title={
          selectedPenyewa?.is_blacklisted
            ? "Hapus dari Blacklist"
            : "Tambah ke Blacklist"
        }
        size="sm"
      >
        <ModalBody>
          <p
            className={`${
              isDark ? "text-dark-secondary" : "text-gray-600"
            } text-sm`}
          >
            {selectedPenyewa?.is_blacklisted
              ? `Apakah Anda yakin ingin menghapus ${selectedPenyewa?.nama} dari blacklist?`
              : `Apakah Anda yakin ingin menambahkan ${selectedPenyewa?.nama} ke blacklist?`}
          </p>
          {selectedPenyewa && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${
                isDark
                  ? "bg-dark-secondary/30 text-dark-muted"
                  : "bg-yellow-50/80 backdrop-blur-sm text-yellow-700 border border-yellow-100"
              }`}
            >
              <p className="font-medium">
                {selectedPenyewa.is_blacklisted
                  ? "Penyewa akan dapat melakukan penyewaan kembali."
                  : "Penyewa tidak akan dapat melakukan penyewaan baru."}
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setShowBlacklistModal(false)}
              disabled={actionLoading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              variant={
                selectedPenyewa?.is_blacklisted ? "success" : "secondary"
              }
              onClick={handleToggleBlacklist}
              isLoading={actionLoading}
              className="flex-1"
            >
              {selectedPenyewa?.is_blacklisted ? "Ya, Hapus" : "Ya, Tambah"}
            </Button>
          </div>
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

export default PenyewaList;
