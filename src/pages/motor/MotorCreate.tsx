import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MotorForm } from "../../components/motor/MotorForm";
import { Button } from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { motorService } from "../../services/motorService";
import { AxiosError } from "axios";
import { useTheme } from "../../hooks/useTheme";

// Define local types untuk menghindari import error
interface CreateMotorData {
  plat_nomor: string;
  merk: string;
  model: string;
  tahun: number;
  harga: number;
  imei?: string;
  status: "tersedia" | "disewa" | "perbaikan" | "pending_perbaikan";
  service_technician?: string;
  service_notes?: string;
}

interface ToastState {
  message: string;
  type: "success" | "error";
  details?: string;
}

const MotorCreate: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [imeiValidation, setImeiValidation] = useState<{
    isValidating: boolean;
    isValid: boolean;
    message?: string;
  }>({
    isValidating: false,
    isValid: false,
  });

  const handleSubmit = async (data: CreateMotorData) => {
    setIsSubmitting(true);
    try {
      console.log("Payload create motor:", data);

      // Validasi IMEI jika diisi
      if (data.imei && data.imei.trim()) {
        setImeiValidation({ isValidating: true, isValid: false });

        try {
          const isValid = await motorService.validateImei(data.imei);

          if (!isValid) {
            setToast({
              message: "Gagal menambahkan motor",
              type: "error",
              details:
                "IMEI tidak valid atau tidak terdaftar di sistem IOPGPS. Pastikan IMEI sudah terdaftar di akun IOPGPS Anda.",
            });
            setIsSubmitting(false);
            setImeiValidation({ isValidating: false, isValid: false });
            return;
          }

          setImeiValidation({ isValidating: false, isValid: true });
        } catch (validationError) {
          console.error("IMEI validation error:", validationError);
          setImeiValidation({
            isValidating: false,
            isValid: false,
            message: "Gagal memvalidasi IMEI dengan sistem IOPGPS",
          });
        }
      }

      // Jika IMEI tidak diisi atau valid, lanjutkan create motor
      await motorService.create(data);

      setToast({
        message: "Motor berhasil ditambahkan",
        type: "success",
        details: data.imei
          ? "IMEI berhasil divalidasi dan motor terhubung dengan sistem GPS."
          : "Motor berhasil ditambahkan tanpa IMEI.",
      });

      setTimeout(() => navigate("/motors"), 2000);
    } catch (err: unknown) {
      let errorMessage = "Gagal menambahkan motor";
      let errorDetails = "";

      if (err instanceof AxiosError) {
        const responseData = err.response?.data;
        errorMessage = responseData?.message || errorMessage;

        if (responseData?.message?.includes("IMEI")) {
          errorDetails =
            "Pastikan IMEI sudah terdaftar di akun IOPGPS Anda dan format IMEI benar.";
        } else if (responseData?.message?.includes("Plat nomor")) {
          errorDetails = "Plat nomor sudah digunakan oleh motor lain.";
        } else if (err.response?.status === 400) {
          errorDetails =
            "Data yang dimasukkan tidak valid. Periksa kembali semua field.";
        } else if (err.response?.status === 500) {
          errorDetails = "Terjadi kesalahan server. Silakan coba lagi.";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }

      console.error("Error create motor:", err);
      setToast({
        message: errorMessage,
        type: "error",
        details: errorDetails,
      });
    } finally {
      setIsSubmitting(false);
      setImeiValidation({ isValidating: false, isValid: false });
    }
  };

  const handleImeiCheck = async (imei: string): Promise<boolean> => {
    if (!imei.trim()) {
      setImeiValidation({ isValidating: false, isValid: false });
      return false;
    }

    setImeiValidation({ isValidating: true, isValid: false });

    try {
      const isValid = await motorService.validateImei(imei);
      setImeiValidation({
        isValidating: false,
        isValid,
        message: isValid
          ? "IMEI valid dan terdaftar di IOPGPS"
          : "IMEI tidak valid atau tidak terdaftar di IOPGPS",
      });
      return isValid;
    } catch (error) {
      setImeiValidation({
        isValidating: false,
        isValid: false,
        message: "Gagal memvalidasi IMEI. Periksa koneksi internet.",
      });
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header dan tombol kembali */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/motors")}>
            ← Kembali ke Daftar Motor
          </Button>
          <div>
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Tambah Motor Baru
            </h1>
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              Tambahkan motor baru ke dalam sistem rental
            </p>
          </div>
        </div>
      </div>

      {/* Informasi IMEI */}
      <div
        className={`rounded-lg p-4 border ${
          isDark
            ? "bg-blue-900/20 border-blue-800"
            : "bg-blue-50 border-blue-200"
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className={`w-5 h-5 ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3
              className={`text-sm font-medium ${
                isDark ? "text-blue-300" : "text-blue-800"
              }`}
            >
              Informasi IMEI
            </h3>
            <div
              className={`mt-1 text-sm ${
                isDark ? "text-blue-400" : "text-blue-700"
              }`}
            >
              <p>• IMEI opsional - motor tanpa IMEI tetap bisa ditambahkan</p>
              <p>
                • IMEI harus terdaftar di akun IOPGPS Anda untuk mengaktifkan
                fitur GPS tracking
              </p>
              <p>
                • Motor dengan IMEI valid akan otomatis terhubung dengan sistem
                GPS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Validasi IMEI */}
      {imeiValidation.isValidating && (
        <div
          className={`rounded-lg p-4 border ${
            isDark
              ? "bg-yellow-900/20 border-yellow-800"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className={`w-5 h-5 animate-spin ${
                  isDark ? "text-yellow-400" : "text-yellow-600"
                }`}
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  isDark ? "text-yellow-300" : "text-yellow-800"
                }`}
              >
                Memvalidasi IMEI dengan sistem IOPGPS...
              </p>
            </div>
          </div>
        </div>
      )}

      {imeiValidation.message && !imeiValidation.isValidating && (
        <div
          className={`rounded-lg p-4 border ${
            imeiValidation.isValid
              ? isDark
                ? "bg-green-900/20 border-green-800"
                : "bg-green-50 border-green-200"
              : isDark
              ? "bg-red-900/20 border-red-800"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {imeiValidation.isValid ? (
                <svg
                  className={`w-5 h-5 ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className={`w-5 h-5 ${
                    isDark ? "text-red-400" : "text-red-600"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  imeiValidation.isValid
                    ? isDark
                      ? "text-green-300"
                      : "text-green-800"
                    : isDark
                    ? "text-red-300"
                    : "text-red-800"
                }`}
              >
                {imeiValidation.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div
        className={`rm-card p-6 rounded-lg border ${
          isDark ? "border-dark-border" : "border-gray-200"
        }`}
      >
        <MotorForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          onImeiCheck={handleImeiCheck}
          imeiValidation={imeiValidation}
          showServiceFields={false} // Service fields disembunyikan untuk create
        />
      </div>

      {/* Informasi Tambahan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div
          className={`rounded-lg p-4 ${
            isDark ? "bg-dark-secondary" : "bg-gray-50"
          }`}
        >
          <h4
            className={`font-medium mb-2 ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Dengan IMEI Valid
          </h4>
          <ul
            className={`space-y-1 ${
              isDark ? "text-dark-secondary" : "text-gray-600"
            }`}
          >
            <li>• Tracking GPS real-time</li>
            <li>• Monitoring lokasi kendaraan</li>
            <li>• Riwayat perjalanan</li>
            <li>• Notifikasi pergerakan</li>
            <li>• Data mileage otomatis</li>
          </ul>
        </div>
        <div
          className={`rounded-lg p-4 ${
            isDark ? "bg-dark-secondary" : "bg-gray-50"
          }`}
        >
          <h4
            className={`font-medium mb-2 ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Tanpa IMEI
          </h4>
          <ul
            className={`space-y-1 ${
              isDark ? "text-dark-secondary" : "text-gray-600"
            }`}
          >
            <li>• Tetap bisa disewakan</li>
            <li>• Manual location update</li>
            <li>• Data mileage manual</li>
            <li>• Basic rental management</li>
            <li>• IMEI bisa ditambahkan nanti</li>
          </ul>
        </div>
      </div>

      {/* Toast message */}
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

export default MotorCreate;
