import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { penyewaService } from "../../services/penyewaService";
import { Penyewa, UpdatePenyewaData } from "../../types/penyewa";
import { PenyewaForm } from "../../components/penyewa/PenyewaForm";
import { Button } from "../../components/ui/Button";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import Loading from "../../components/ui/Loading";
import Toast from "../../components/ui/Toast";
import { useTheme } from "../../hooks/useTheme";

const PenyewaEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [penyewa, setPenyewa] = useState<Penyewa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const loadPenyewa = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await penyewaService.getById(parseInt(id));
        setPenyewa(data);
      } catch (error: unknown) {
        console.error("Error loading penyewa:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Gagal memuat data penyewa";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    loadPenyewa();
  }, [id]);

  const handleSubmit = async (data: UpdatePenyewaData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      // Pastikan no_whatsapp tidak undefined
      let normalizedNoWhatsapp = data.no_whatsapp?.trim() || "";

      // Normalisasi nomor WhatsApp
      if (normalizedNoWhatsapp.startsWith("0")) {
        normalizedNoWhatsapp = "62" + normalizedNoWhatsapp.substring(1);
      } else if (normalizedNoWhatsapp.startsWith("+62")) {
        normalizedNoWhatsapp = normalizedNoWhatsapp.substring(1);
      }

      const submitData: UpdatePenyewaData = {
        ...data,
        no_whatsapp: normalizedNoWhatsapp,
        // foto_ktp sudah termasuk dalam data dari PenyewaForm
      };

      // HANYA 2 PARAMETER - sesuaikan dengan service yang sudah diperbaiki
      await penyewaService.update(parseInt(id), submitData);

      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error("Error updating penyewa:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memperbarui penyewa";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format nomor WhatsApp untuk form (ubah 62 menjadi 0 jika perlu)
  const formatPenyewaForForm = (penyewaData: Penyewa): Penyewa => {
    let formattedNoWhatsapp = penyewaData.no_whatsapp;

    // Jika nomor disimpan sebagai 62 di database, ubah ke 0 untuk form
    if (
      formattedNoWhatsapp.startsWith("62") &&
      formattedNoWhatsapp.length >= 11
    ) {
      formattedNoWhatsapp = "0" + formattedNoWhatsapp.substring(2);
    }

    return {
      ...penyewaData,
      no_whatsapp: formattedNoWhatsapp,
    };
  };

  const handleBack = () => {
    navigate("/penyewas");
  };

  const handleViewDetail = () => {
    navigate(`/penyewas/${id}`);
  };

  const handleSuccessModalConfirm = () => {
    setShowSuccessModal(false);
    navigate("/penyewas");
  };

  const handleSuccessModalViewDetail = () => {
    setShowSuccessModal(false);
    navigate(`/penyewas/${id}`);
  };

  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    navigate("/penyewas");
  };

  if (isLoading) return <Loading />;

  if (!penyewa) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div
            className={`text-lg mb-4 ${
              isDark ? "text-red-400" : "text-red-600"
            }`}
          >
            Penyewa tidak ditemukan
          </div>
          <Button onClick={handleBack}>Kembali ke Daftar Penyewa</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowCancelModal(true)}
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
            Edit Penyewa
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={handleViewDetail}
          disabled={isSubmitting}
        >
          Lihat Detail
        </Button>
      </div>

      {/* Form Container */}
      <div
        className={`rm-card p-6 ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <PenyewaForm
          penyewa={formatPenyewaForForm(penyewa)}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>

      {/* Modal Success */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalConfirm}
        title="Berhasil!"
        size="sm"
        closeOnOverlayClick={false}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleSuccessModalConfirm}
              className="flex-1"
            >
              Ke Daftar Penyewa
            </Button>
            <Button onClick={handleSuccessModalViewDetail} className="flex-1">
              Lihat Detail
            </Button>
          </div>
        }
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
              Data Berhasil Diperbarui
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Data penyewa <strong>{penyewa.nama}</strong> telah berhasil
              diperbarui.
            </p>
          </div>
        </ModalBody>
      </Modal>

      {/* Modal Cancel Confirmation */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Batalkan Perubahan?"
        size="sm"
      >
        <ModalBody>
          <div className="text-center py-4">
            <div
              className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                isDark ? "bg-yellow-900/20" : "bg-yellow-100"
              } mb-4`}
            >
              <svg
                className={`h-6 w-6 ${
                  isDark ? "text-yellow-400" : "text-yellow-600"
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
              Perubahan Belum Disimpan
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              } mb-4`}
            >
              Apakah Anda yakin ingin meninggalkan halaman ini? Semua perubahan
              yang belum disimpan akan hilang.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCancelModal(false)}>
            Lanjutkan Edit
          </Button>
          <Button variant="secondary" onClick={handleCancelConfirm}>
            Ya, Tinggalkan
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

export default PenyewaEdit;
