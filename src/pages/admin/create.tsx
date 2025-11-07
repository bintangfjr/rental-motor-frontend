import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminForm } from "../../components/admin/AdminForm";
import { Button } from "../../components/ui/Button";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";
import { CreateAdminData } from "../../types/admin";
import { useTheme } from "../../hooks/useTheme";

const AdminCreate: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [, setFormData] = useState<CreateAdminData | null>(null);

  const handleSubmit = async (data: CreateAdminData) => {
    setIsSubmitting(true);
    setFormData(data); // Simpan data form untuk potential recovery

    try {
      // Pastikan password_confirmation sesuai dengan password
      const payload: CreateAdminData = {
        nama_lengkap: data.nama_lengkap,
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation || data.password,
        is_super_admin: Boolean(data.is_super_admin),
      };

      console.log("Payload dikirim ke backend:", payload);

      await adminService.create(payload);

      // Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Gagal membuat admin:", err);

      // Handle error response dengan lebih baik
      let errorMessage = "Gagal membuat admin";

      if (err.response?.data) {
        const errorData = err.response.data;

        // Handle berbagai format error dari backend
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else if (typeof errorData.message === "string") {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.error("Error details:", errorMessage);
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Langsung kembali tanpa modal konfirmasi
    navigate("/admins");
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate("/admins");
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    // Reset form dengan mereload halaman
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleCancel}
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
            Kembali ke Daftar Admin
          </Button>
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Tambah Admin Baru
          </h1>
        </div>
      </div>

      {/* Form */}
      <div
        className={`rm-card p-6 ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <AdminForm<CreateAdminData>
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          isEdit={false}
        />
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessConfirm}
        title="Berhasil!"
        size="sm"
        closeOnOverlayClick={false}
      >
        <ModalBody>
          <div className="text-center py-4">
            <div
              className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                isDark ? "bg-green-900/20" : "bg-green-100"
              } mb-4`}
            >
              <svg
                className={`h-6 w-6 ${
                  isDark ? "text-green-400" : "text-green-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Admin Berhasil Ditambahkan
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Data admin baru telah berhasil disimpan ke dalam sistem.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleSuccessConfirm}
              className="flex-1"
            >
              Lihat Daftar Admin
            </Button>
            <Button onClick={handleAddAnother} className="flex-1">
              Tambah Lagi
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
          duration={toast.type === "error" ? 5000 : 3000}
        />
      )}
    </div>
  );
};

export default AdminCreate;
