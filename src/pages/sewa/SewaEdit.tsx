import React, { useState, useEffect, lazy } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { sewaService } from "../../services/sewaService";
import { motorService } from "../../services/motorService";
import { penyewaService } from "../../services/penyewaService";
import { Sewa, UpdateSewaData } from "../../types/sewa";
import { Button } from "../../components/ui/Button";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { useTheme } from "../../hooks/useTheme";
import Loading from "../../components/ui/Loading";

const SewaForm = lazy(() => import("../../components/sewa/SewaForm"));

interface Motor {
  id: number;
  plat_nomor: string;
  merk: string;
  model: string;
  harga: number;
  status: string;
}

interface Penyewa {
  id: number;
  nama: string;
  no_whatsapp: string;
  alamat?: string;
  is_blacklisted: boolean;
}

const SewaEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [sewa, setSewa] = useState<Sewa | null>(null);
  const [motors, setMotors] = useState<Motor[]>([]);
  const [penyewas, setPenyewas] = useState<Penyewa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ✅ Load data sewa, motor, penyewa
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [sewaData, motorsData, penyewasData] = await Promise.all([
          sewaService.getById(parseInt(id)),
          motorService.getAll(),
          penyewaService.getAll(),
        ]);

        setSewa(sewaData);
        setMotors(Array.isArray(motorsData) ? motorsData : []);
        setPenyewas(Array.isArray(penyewasData) ? penyewasData : []);
      } catch (error: unknown) {
        console.error("Error loading data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Gagal memuat data sewa";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ✅ Handle submit update
  const handleSubmit = async (data: UpdateSewaData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await sewaService.update(parseInt(id), data);
      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error("Error updating sewa:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memperbarui sewa";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate("/sewas");
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setShowCancelModal(true);
  };

  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    navigate("/sewas");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!sewa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className={`text-xl font-semibold mb-4 ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Sewa tidak ditemukan
          </div>
          <Button onClick={() => navigate("/sewas")}>
            Kembali ke Daftar Sewa
          </Button>
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
            Kembali
          </Button>
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Edit Sewa
          </h1>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            sewa.status === "aktif"
              ? isDark
                ? "bg-green-900/20 text-green-300"
                : "bg-green-100 text-green-800"
              : sewa.status === "selesai"
              ? isDark
                ? "bg-blue-900/20 text-blue-300"
                : "bg-blue-100 text-blue-800"
              : isDark
              ? "bg-gray-900/20 text-gray-300"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {sewa.status === "aktif"
            ? "Aktif"
            : sewa.status === "selesai"
            ? "Selesai"
            : "Dibatalkan"}
        </div>
      </div>

      {/* Content Card */}
      <div
        className={`rm-card p-6 ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <React.Suspense
          fallback={
            <div className="flex justify-center items-center py-8">
              <Loading />
            </div>
          }
        >
          <SewaForm
            sewa={sewa}
            motors={motors}
            penyewas={penyewas}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            isEdit={true}
          />
        </React.Suspense>
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
              Sewa Berhasil Diperbarui
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Data sewa telah berhasil diperbarui dalam sistem.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSuccessConfirm} className="w-full">
            Kembali ke Daftar Sewa
          </Button>
        </ModalFooter>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Konfirmasi Pembatalan"
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
              Batalkan Perubahan?
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              } mb-4`}
            >
              Perubahan yang belum disimpan akan hilang. Apakah Anda yakin ingin
              membatalkan?
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowCancelModal(false)}
            className="flex-1"
          >
            Lanjut Edit
          </Button>
          <Button onClick={handleCancelConfirm} className="flex-1">
            Ya, Batalkan
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

export default SewaEdit;
