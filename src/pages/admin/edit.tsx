import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminForm } from "../../components/admin/AdminForm";
import { Button } from "../../components/ui/Button";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";
import { UpdateAdminData, Admin } from "../../types/admin";
import { useTheme } from "../../hooks/useTheme";

const AdminEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [defaultValues, setDefaultValues] = useState<Partial<UpdateAdminData>>(
    {}
  );
  const [originalData, setOriginalData] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // State untuk modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<UpdateAdminData | null>(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        if (!id) return;
        const admin = await adminService.getById(Number(id));
        setOriginalData(admin);
        setDefaultValues({
          nama_lengkap: admin.nama_lengkap,
          username: admin.username,
          email: admin.email,
          is_super_admin: admin.is_super_admin,
          password: "", // Pastikan password kosong
          password_confirmation: "", // Pastikan konfirmasi password kosong
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Gagal mengambil data admin";
        setToast({ message, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmin();
  }, [id]);

  // Fungsi untuk mengecek apakah data berubah
  const hasDataChanged = (newData: UpdateAdminData): boolean => {
    if (!originalData) return false;

    // Konversi is_super_admin ke boolean untuk perbandingan yang konsisten
    const newIsSuperAdmin = Boolean(newData.is_super_admin);
    const originalIsSuperAdmin = Boolean(originalData.is_super_admin);

    // Cek perubahan pada field utama
    const mainFieldsChanged =
      newData.nama_lengkap !== originalData.nama_lengkap ||
      newData.username !== originalData.username ||
      newData.email !== originalData.email ||
      newIsSuperAdmin !== originalIsSuperAdmin;

    // Cek jika password diisi
    const passwordChanged = !!(
      newData.password && newData.password.trim() !== ""
    );

    return mainFieldsChanged || passwordChanged;
  };

  // Fungsi untuk mendapatkan perubahan data
  const getChangedFields = (newData: UpdateAdminData): string[] => {
    if (!originalData) return [];

    const changes: string[] = [];
    const newIsSuperAdmin = Boolean(newData.is_super_admin);
    const originalIsSuperAdmin = Boolean(originalData.is_super_admin);

    if (newData.nama_lengkap !== originalData.nama_lengkap) {
      changes.push(
        `Nama: "${originalData.nama_lengkap}" → "${newData.nama_lengkap}"`
      );
    }
    if (newData.username !== originalData.username) {
      changes.push(
        `Username: "${originalData.username}" → "${newData.username}"`
      );
    }
    if (newData.email !== originalData.email) {
      changes.push(`Email: "${originalData.email}" → "${newData.email}"`);
    }
    if (newIsSuperAdmin !== originalIsSuperAdmin) {
      changes.push(
        `Role: ${originalIsSuperAdmin ? "Super Admin" : "Admin"} → ${
          newIsSuperAdmin ? "Super Admin" : "Admin"
        }`
      );
    }
    if (newData.password && newData.password.trim() !== "") {
      changes.push("Password: •••••••• (diubah)");
    }

    return changes;
  };

  const handleSubmit = async (data: UpdateAdminData) => {
    if (!id) return;

    // Cek apakah data berubah
    if (!hasDataChanged(data)) {
      setToast({
        message: "Tidak ada perubahan data",
        type: "error",
      });
      return;
    }

    // Simpan data yang akan dikirim dan tampilkan modal konfirmasi
    setPendingData(data);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!id || !pendingData) return;

    setIsSubmitting(true);
    setShowConfirmModal(false);

    // Buat payload yang bersih
    const submitData: UpdateAdminData = {
      nama_lengkap: pendingData.nama_lengkap,
      username: pendingData.username,
      email: pendingData.email,
      is_super_admin: Boolean(pendingData.is_super_admin),
    };

    // Hanya sertakan password jika diisi dan tidak kosong
    if (pendingData.password && pendingData.password.trim() !== "") {
      submitData.password = pendingData.password;
    }

    console.log("Payload dikirim ke backend:", submitData);

    try {
      await adminService.update(Number(id), submitData);
      setToast({
        message: "Admin berhasil diperbarui",
        type: "success",
      });
      setTimeout(() => navigate("/admins"), 1000);
    } catch (error: unknown) {
      let errorMessage = "Gagal memperbarui admin";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
      setPendingData(null);
    }
  };

  const handleCancelEdit = () => {
    setShowConfirmModal(false);
    setPendingData(null);
  };

  const handleBack = () => {
    navigate("/admins");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? "border-blue-400" : "border-blue-600"
          }`}
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isSubmitting}
          className="flex items-center gap-2"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali
        </Button>
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          Edit Admin
        </h1>
      </div>

      {/* Form */}
      <div
        className={`rm-card p-6 ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <AdminForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          defaultValues={defaultValues}
          isEdit={true}
        />
      </div>

      {/* Modal Konfirmasi Perubahan */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCancelEdit}
        title="Konfirmasi Perubahan Data Admin"
        size="md"
      >
        <ModalBody>
          <div className="text-center py-4">
            <div
              className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                isDark ? "bg-blue-900/20" : "bg-blue-100"
              } mb-4`}
            >
              <svg
                className={`h-6 w-6 ${
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Konfirmasi Perubahan Data
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              } mb-4`}
            >
              Anda akan mengubah data admin berikut:
            </p>

            {pendingData && originalData && (
              <div
                className={`text-left p-3 rounded-lg ${
                  isDark ? "bg-dark-secondary/30" : "bg-blue-50"
                }`}
              >
                <h4
                  className={`font-medium mb-2 ${
                    isDark ? "text-dark-primary" : "text-blue-800"
                  }`}
                >
                  Perubahan Data:
                </h4>
                <ul
                  className={`text-sm space-y-1 ${
                    isDark ? "text-dark-muted" : "text-blue-700"
                  }`}
                >
                  {getChangedFields(pendingData).map((change, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                isDark
                  ? "bg-yellow-900/20 text-yellow-300"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              <p className="font-medium">
                Pastikan data yang diubah sudah benar!
              </p>
              <p className="mt-1">
                Perubahan tidak dapat dibatalkan setelah disimpan.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button onClick={handleConfirmSubmit} loading={isSubmitting}>
            Ya, Simpan Perubahan
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

export default AdminEdit;
