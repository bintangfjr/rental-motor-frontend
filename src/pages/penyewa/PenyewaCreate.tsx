import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { penyewaService } from "../../services/penyewaService";
import { CreatePenyewaData } from "../../types/penyewa";
import { PenyewaForm } from "../../components/penyewa/PenyewaForm";
import { Button } from "../../components/ui/Button";
import { Modal, ModalBody } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { useTheme } from "../../hooks/useTheme";

export const PenyewaCreate: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleSubmit = async (data: CreatePenyewaData) => {
    setIsLoading(true);
    try {
      // Normalisasi nomor WhatsApp sebelum disimpan
      let normalizedNoWhatsapp = data.no_whatsapp.trim();

      // Jika nomor diawali dengan 0, ubah menjadi 62
      if (normalizedNoWhatsapp.startsWith("0")) {
        normalizedNoWhatsapp = "62" + normalizedNoWhatsapp.substring(1);
      }
      // Jika nomor diawali dengan +62, hapus tanda +
      else if (normalizedNoWhatsapp.startsWith("+62")) {
        normalizedNoWhatsapp = normalizedNoWhatsapp.substring(1);
      }

      const submitData: CreatePenyewaData = {
        ...data,
        no_whatsapp: normalizedNoWhatsapp,
        // foto_ktp sudah berupa base64 string dari PenyewaForm
      };

      // Panggil service create - hanya 1 parameter
      await penyewaService.create(submitData);

      setToast({
        message: "Penyewa berhasil ditambahkan",
        type: "success",
      });

      // Tampilkan modal konfirmasi
      setShowModal(true);
    } catch (error: unknown) {
      console.error("Error creating penyewa:", error);

      // Handle error yang lebih spesifik
      let errorMessage = "Gagal menambahkan penyewa";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/penyewas");
  };

  const handleBack = () => {
    if (isLoading) return;
    navigate("/penyewas");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
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
            Tambah Penyewa Baru
          </h1>
        </div>
      </div>

      <div
        className={`rm-card p-6 ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <PenyewaForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Modal Konfirmasi Berhasil */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title="Berhasil!"
        size="sm"
        closeOnOverlayClick={false}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleModalClose}
              className="flex-1"
            >
              Lihat Daftar Penyewa
            </Button>
            <Button
              onClick={() => {
                setShowModal(false);
                // Reset form dengan reload halaman
                window.location.reload();
              }}
              className="flex-1"
            >
              Tambah Lagi
            </Button>
          </div>
        }
      >
        <ModalBody>
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
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
              className={`text-lg font-medium ${
                isDark ? "text-dark-primary" : "text-gray-900"
              } mb-2`}
            >
              Penyewa Berhasil Ditambahkan
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Data penyewa telah berhasil disimpan ke dalam sistem.
            </p>
          </div>
        </ModalBody>
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

export default PenyewaCreate;
