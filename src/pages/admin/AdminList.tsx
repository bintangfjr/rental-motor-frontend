import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { Admin } from "../../types/admin";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { DataTable, Column } from "../../components/ui/DataTable";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import Loading from "../../components/ui/Loading";
import { EmptyState } from "../../components/common/EmptyState";
import { useTheme } from "../../hooks/useTheme";
import { formatDate } from "../../utils/formatters";

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
      d="M19.4 15C19.2662 15.3044 19.1929 15.6345 19.2 16C19.2 16.5304 19.4107 17.0391 19.7857 17.4142C20.1608 17.7893 20.6696 18 21.2 18C21.5655 18.0071 21.8956 17.9338 22.2 17.8C22.2 18.9205 21.9686 20.0276 21.5218 21.0512C21.075 22.0748 20.422 22.9941 19.6035 23.7516C18.7851 24.5092 17.8186 25.0894 16.7634 25.4567C15.7083 25.824 14.5863 25.9708 13.466 25.8881C12.3457 25.8054 11.2506 25.4948 10.2453 24.9749C9.23998 24.455 8.34534 23.7365 7.6146 22.8617C6.88385 21.9869 6.33223 20.974 5.99253 19.8839C5.65283 18.7938 5.53214 17.6487 5.63751 16.5128C5.74288 14.6231 6.07213 15.7271 6.606 16.737C7.13987 17.7469 7.86769 18.6416 8.7448 19.3684C9.62191 20.0952 10.6308 20.6389 11.7104 20.968C12.79 21.2971 13.9178 21.4048 15.0344 21.2846C16.151 21.1645 17.2332 20.8191 18.2148 20.2687C19.1964 19.7183 20.0567 18.9742 20.7424 18.0817C21.4282 17.1892 21.9244 16.1674 22.2 15.08"
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
  admin: Admin;
  onEdit: (admin: Admin) => void;
  onDelete: (admin: Admin) => void;
  onRestore: (admin: Admin) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ admin, onEdit, onDelete, onRestore, isOpen, onClose }) => {
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
        <div className="space-y-1">
          {/* Edit */}
          <button
            onClick={() => onEdit(admin)}
            className={`flex items-center w-full p-3 transition-all duration-200 rounded-lg hover:scale-105 ${
              isDark
                ? "text-dark-secondary hover:bg-dark-hover"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-4 h-4 mr-2"
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
            <span className="text-sm font-medium">Edit</span>
          </button>

          {/* Delete atau Restore */}
          {admin.deleted_at ? (
            <button
              onClick={() => onRestore(admin)}
              className={`flex items-center w-full p-3 transition-all duration-200 rounded-lg hover:scale-105 ${
                isDark
                  ? "text-green-400 hover:bg-green-900/20"
                  : "text-green-600 hover:bg-green-50"
              }`}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-sm font-medium">Pulihkan</span>
            </button>
          ) : (
            <button
              onClick={() => onDelete(admin)}
              className={`flex items-center w-full p-3 transition-all duration-200 rounded-lg hover:scale-105 ${
                isDark
                  ? "text-red-400 hover:bg-red-900/20"
                  : "text-red-600 hover:bg-red-50"
              }`}
            >
              <svg
                className="w-4 h-4 mr-2"
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
          )}
        </div>
      </div>
    </div>
  );
};

const AdminList: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAll();
      setAdmins(data);
    } catch (err: any) {
      console.error("Error loading admins:", err);
      const message = err?.response?.data?.message || "Gagal memuat data admin";
      setToast({ message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    setActionLoading(true);
    try {
      await adminService.softDelete(selectedAdmin.id);
      setToast({ message: "Admin berhasil dihapus", type: "success" });
      setAdmins((prev) => prev.filter((a) => a.id !== selectedAdmin.id));
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    } catch (err: any) {
      console.error("Error deleting admin:", err);
      const message = err?.response?.data?.message || "Gagal menghapus admin";
      setToast({ message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedAdmin) return;

    setActionLoading(true);
    try {
      await adminService.restore(selectedAdmin.id);
      setToast({ message: "Admin berhasil dipulihkan", type: "success" });
      setShowRestoreModal(false);
      setSelectedAdmin(null);
      loadAdmins(); // Reload untuk mendapatkan data terbaru
    } catch (err: any) {
      console.error("Error restoring admin:", err);
      const message = err?.response?.data?.message || "Gagal memulihkan admin";
      setToast({ message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (admin: Admin) => {
    navigate(`/admins/${admin.id}/edit`);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleRestoreClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowRestoreModal(true);
    setOpenMenuId(null);
  };

  const getRoleBadge = (isSuperAdmin: boolean) => {
    return isSuperAdmin ? (
      <Badge variant="primary">Super Admin</Badge>
    ) : (
      <Badge variant="secondary">Admin</Badge>
    );
  };

  const getStatusBadge = (deletedAt: string | null) => {
    return deletedAt ? (
      <Badge variant="danger">Nonaktif</Badge>
    ) : (
      <Badge variant="success">Aktif</Badge>
    );
  };

  // Filter admins berdasarkan search query
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Admin>[] = [
    {
      key: "nama_lengkap",
      header: "Nama Lengkap",
      sortable: true,
    },
    {
      key: "username",
      header: "Username",
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "is_super_admin",
      header: "Role",
      render: (_, row) => getRoleBadge(row.is_super_admin),
      sortable: true,
    },
    {
      key: "deleted_at",
      header: "Status",
      render: (_, row) => getStatusBadge(row.deleted_at),
      sortable: true,
    },
    {
      key: "created_at",
      header: "Tanggal Dibuat",
      render: (value) => (value ? formatDate(value as string) : "-"),
      sortable: true,
    },
    {
      key: "id",
      header: "Aksi",
      render: (_, row) => (
        <div className="relative flex justify-center">
          <button
            onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
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
            admin={row}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onRestore={handleRestoreClick}
            isOpen={openMenuId === row.id}
            onClose={() => setOpenMenuId(null)}
          />
        </div>
      ),
    },
  ];

  if (isLoading) return <Loading />;

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
            Daftar Admin
          </h1>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            Total {filteredAdmins.length} admin
          </p>
        </div>
        <Button onClick={() => navigate("/admins/create")}>
          + Tambah Admin
        </Button>
      </div>

      <Card>
        {admins.length === 0 ? (
          <EmptyState
            title="Belum ada admin"
            description="Tambahkan admin pertama untuk mulai mengelola sistem."
            action={{
              label: "Tambah Admin",
              onClick: () => navigate("/admins/create"),
            }}
          />
        ) : (
          <DataTable<Admin>
            columns={columns}
            data={filteredAdmins}
            search={{
              placeholder: "Cari nama, username, atau email...",
              onSearch: setSearchQuery,
            }}
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredAdmins.length,
              onPageChange: (page, newSize) => {
                setCurrentPage(page);
                if (newSize) setPageSize(newSize);
              },
            }}
          />
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus Admin"
        size="sm"
      >
        <ModalBody>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            Apakah Anda yakin ingin menghapus admin{" "}
            <span
              className={`font-semibold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              {selectedAdmin?.nama_lengkap}
            </span>
            ?
          </p>
          {selectedAdmin && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${
                isDark
                  ? "bg-dark-secondary/30 text-dark-muted"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <p className="font-medium">
                Admin akan dinonaktifkan secara soft delete.
              </p>
              <p className="mt-1">
                Data tetap tersimpan di database tetapi tidak dapat login.
              </p>
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

      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title="Konfirmasi Pulihkan Admin"
        size="sm"
      >
        <ModalBody>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            Apakah Anda yakin ingin memulihkan admin{" "}
            <span
              className={`font-semibold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              {selectedAdmin?.nama_lengkap}
            </span>
            ?
          </p>
          {selectedAdmin && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${
                isDark
                  ? "bg-dark-secondary/30 text-dark-muted"
                  : "bg-green-50 text-green-700"
              }`}
            >
              <p className="font-medium">Admin akan diaktifkan kembali.</p>
              <p className="mt-1">
                Admin dapat login dan menggunakan sistem seperti semula.
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowRestoreModal(false)}
            disabled={actionLoading}
          >
            Batal
          </Button>
          <Button
            variant="success"
            onClick={handleRestore}
            loading={actionLoading}
          >
            Ya, Pulihkan
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

export default AdminList;
