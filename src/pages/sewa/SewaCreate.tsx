import React, { useState, useEffect, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { sewaService } from "../../services/sewaService";
import { motorService } from "../../services/motorService";
import { penyewaService } from "../../services/penyewaService";
import { CreateSewaData, Sewa } from "../../types/sewa";
import { Button } from "../../components/ui/Button";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { useTheme } from "../../hooks/useTheme";

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
  is_blacklisted: boolean;
}

const SewaCreate: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [motors, setMotors] = useState<Motor[]>([]);
  const [penyewas, setPenyewas] = useState<Penyewa[]>([]);
  const [activeSewas, setActiveSewas] = useState<Sewa[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const [motorsData, penyewasData, sewasData] = await Promise.all([
        motorService.getAll(),
        penyewaService.getAll(),
        sewaService.getAll(),
      ]);

      setMotors(motorsData);
      setPenyewas(penyewasData);
      setActiveSewas(sewasData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memuat data";
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Filter motor yang tersedia (status = 'tersedia')
  const getAvailableMotors = () => {
    return motors.filter((motor) => motor.status === "tersedia");
  };

  // ✅ PERBAIKAN: Filter penyewa yang tidak memiliki sewa aktif dan tidak blacklisted
  const getAvailablePenyewas = () => {
    // Dapatkan ID penyewa yang memiliki sewa dengan status aktif atau lewat tempo
    const activePenyewaIds = activeSewas
      .filter(
        (sewa) =>
          sewa.status === "aktif" ||
          sewa.status === "Lewat Tempo" ||
          sewaService.isSewaAktif(sewa)
      )
      .map((sewa) => sewa.penyewa_id)
      .filter((id): id is number => id !== undefined && id !== null);

    console.log("🔍 DEBUG Available Penyewas:", {
      totalPenyewas: penyewas.length,
      activeSewasCount: activeSewas.length,
      activePenyewaIds,
      activeSewas: activeSewas.map((s) => ({
        id: s.id,
        penyewa_id: s.penyewa_id,
        status: s.status,
        isSewaAktif: sewaService.isSewaAktif(s),
      })),
    });

    return penyewas.filter(
      (penyewa) =>
        !penyewa.is_blacklisted && !activePenyewaIds.includes(penyewa.id)
    );
  };

  const handleSubmit = async (data: CreateSewaData) => {
    setIsLoading(true);
    try {
      console.log("Data yang dikirim ke backend:", data);

      await sewaService.create(data);

      // Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error("Error creating sewa:", error);

      let errorMessage = "Gagal menambahkan sewa";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalConfirm = () => {
    setShowSuccessModal(false);
    navigate("/sewas");
  };

  const handleSuccessModalAddMore = () => {
    setShowSuccessModal(false);
    // Reset form dengan reload komponen
    window.location.reload();
  };

  const handleCancel = () => {
    navigate("/sewas");
  };

  const handleManageMotors = () => {
    navigate("/motors");
  };

  const handleManagePenyewas = () => {
    navigate("/penyewas");
  };

  const availableMotors = getAvailableMotors();
  const availablePenyewas = getAvailablePenyewas();

  // Cek apakah ada warning untuk ditampilkan
  const hasWarning =
    availableMotors.length === 0 || availablePenyewas.length === 0;

  useEffect(() => {
    if (!isLoadingData && hasWarning) {
      setShowWarningModal(true);
    }
  }, [isLoadingData, hasWarning]);

  return (
    <div className="space-y-6">
      {/* ✅ HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2"
            disabled={isLoading}
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
            Kembali ke Daftar Sewa
          </Button>
          <div>
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Tambah Sewa Baru
            </h1>
            <p
              className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}
            >
              Isi form berikut untuk membuat sewa baru
            </p>
          </div>
        </div>
      </div>

      {/* ✅ FORM SECTION */}
      <div
        className={`rm-card p-6 ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        {isLoadingData ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div
                className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
                  isDark ? "border-blue-400" : "border-blue-600"
                }`}
              ></div>
              <p
                className={`${
                  isDark ? "text-dark-secondary" : "text-gray-600"
                }`}
              >
                Memuat data motor dan penyewa...
              </p>
            </div>
          </div>
        ) : (
          <React.Suspense
            fallback={
              <div className="flex justify-center items-center py-8">
                <div
                  className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                    isDark ? "border-blue-400" : "border-blue-600"
                  }`}
                ></div>
                <span
                  className={`ml-2 ${
                    isDark ? "text-dark-secondary" : "text-gray-600"
                  }`}
                >
                  Memuat form sewa...
                </span>
              </div>
            }
          >
            <SewaForm
              motors={availableMotors}
              penyewas={availablePenyewas}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </React.Suspense>
        )}
      </div>

      {/* ✅ SUCCESS MODAL */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalConfirm}
        title="Sewa Berhasil Ditambahkan!"
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
              Sewa Berhasil Dibuat
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Data sewa telah berhasil disimpan ke dalam sistem.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleSuccessModalConfirm}
              className="flex-1"
            >
              Lihat Daftar Sewa
            </Button>
            <Button onClick={handleSuccessModalAddMore} className="flex-1">
              Tambah Sewa Lagi
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* ✅ WARNING MODAL */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="⚠ Keterbatasan Data"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <div
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              <p>Beberapa data tidak tersedia untuk membuat sewa baru:</p>
            </div>

            <div
              className={`space-y-3 text-sm ${
                isDark ? "bg-dark-secondary/30" : "bg-yellow-50"
              } p-4 rounded-lg`}
            >
              {availableMotors.length === 0 && (
                <div className="flex items-start space-x-2">
                  <svg
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
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
                  <div>
                    <p
                      className={`font-medium ${
                        isDark ? "text-yellow-300" : "text-yellow-800"
                      }`}
                    >
                      Tidak ada motor yang tersedia
                    </p>
                    <p
                      className={`mt-1 ${
                        isDark ? "text-dark-muted" : "text-yellow-700"
                      }`}
                    >
                      Semua motor sedang dalam penyewaan aktif atau dalam
                      perbaikan.
                    </p>
                  </div>
                </div>
              )}

              {availablePenyewas.length === 0 && (
                <div className="flex items-start space-x-2">
                  <svg
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
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
                  <div>
                    <p
                      className={`font-medium ${
                        isDark ? "text-yellow-300" : "text-yellow-800"
                      }`}
                    >
                      Tidak ada penyewa yang tersedia
                    </p>
                    <p
                      className={`mt-1 ${
                        isDark ? "text-dark-muted" : "text-yellow-700"
                      }`}
                    >
                      Semua penyewa sedang dalam penyewaan aktif atau dalam
                      daftar hitam.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`text-xs ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              <p>
                Anda masih dapat melanjutkan membuat sewa, tetapi pilihan akan
                terbatas.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleManageMotors}
              className="flex-1"
            >
              Kelola Motor
            </Button>
            <Button
              variant="outline"
              onClick={handleManagePenyewas}
              className="flex-1"
            >
              Kelola Penyewa
            </Button>
            <Button
              onClick={() => setShowWarningModal(false)}
              className="flex-1"
            >
              Lanjutkan
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* ✅ TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === "success" ? 3000 : 5000}
        />
      )}
    </div>
  );
};

export default SewaCreate;
