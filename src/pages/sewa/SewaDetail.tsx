import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { sewaService } from "../../services/sewaService";
import { whatsappService } from "../../services/whatsappService";
import { motorService } from "../../services/motorService";
import { Sewa } from "../../types/sewa";
import { MotorWithIopgps } from "../../types/motor";
import { Button } from "../../components/ui/Button";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import SewaActions from "../../components/sewa/SewaActions";
import SewaInfo from "../../components/sewa/SewaInfo";
import { useTheme } from "../../hooks/useTheme";
import { Badge } from "../../components/ui/Badge";
import Loading from "../../components/ui/Loading";
import { formatCurrency } from "../../utils/formatters";

const SewaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [sewa, setSewa] = useState<Sewa | null>(null);
  const [motorData, setMotorData] = useState<MotorWithIopgps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Modal states
  const [showSelesaiModal, setShowSelesaiModal] = useState(false);
  const [showHapusModal, setShowHapusModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppAction, setWhatsAppAction] = useState<
    "reminder" | "alert" | ""
  >("");

  // ✅ PERBAIKAN: Load data sewa dan data motor terkait
  const loadSewaData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      // 1. Load data sewa
      const sewaData = await sewaService.getById(parseInt(id));
      setSewa(sewaData);

      // 2. Load data motor terkait jika ada motor_id
      if (sewaData.motor_id) {
        try {
          const motorDetail = await motorService.getById(sewaData.motor_id);
          setMotorData(motorDetail);
        } catch (motorError) {
          console.warn("Gagal memuat data motor:", motorError);
          // Tetap lanjut meskipun data motor gagal
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memuat data sewa";

      console.error("Error loading sewa:", error);

      if (
        errorMessage.includes("tidak ditemukan") ||
        errorMessage.includes("sudah selesai") ||
        errorMessage.includes("404")
      ) {
        showToast("Sewa sudah diselesaikan dan data tidak tersedia", "success");
        setTimeout(() => navigate("/sewas"), 2000);
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // ✅ PERBAIKAN: Helper function untuk status GPS
  const getGpsStatusBadge = (status: string) => {
    const statusConfig = {
      Online: { variant: "success" as const, label: "Online" },
      Offline: { variant: "warning" as const, label: "Offline" },
      NoImei: { variant: "secondary" as const, label: "No IMEI" },
      Error: { variant: "danger" as const, label: "Error" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      label: status,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // ✅ PERBAIKAN: Helper function untuk status motor
  const getMotorStatusBadge = (status: string) => {
    const statusMap = {
      tersedia: <Badge variant="success">Tersedia</Badge>,
      disewa: <Badge variant="warning">Disewa</Badge>,
      perbaikan: <Badge variant="danger">Perbaikan</Badge>,
      pending_perbaikan: <Badge variant="warning">Pending Service</Badge>,
    };

    return (
      statusMap[status as keyof typeof statusMap] || (
        <Badge variant="secondary">{status}</Badge>
      )
    );
  };

  // ✅ PERBAIKAN: Handle selesai sewa dengan format tanggal yang benar
  const handleSelesai = async () => {
    if (!sewa) return;

    try {
      setIsProcessing(true);

      // ✅ FORMAT TANGGAL YANG BENAR UNTUK BACKEND - Simple format
      const sekarang = new Date();
      const tglSelesai = sekarang.toISOString().slice(0, 16); // Format: "2025-11-09T13:24"

      console.log("🕐 Mengirim data selesai:", {
        tglSelesai,
        sekarang: sekarang.toLocaleString("id-ID"),
        isLewatTempo,
        estimatedDenda: isLewatTempo
          ? sewaService.calculateEstimatedDenda(sewa)
          : 0,
      });

      const result = await sewaService.selesai(sewa.id, {
        tgl_selesai: tglSelesai,
        catatan: "Sewa diselesaikan melalui sistem",
      });

      showToast(
        result.message || "Sewa berhasil diselesaikan! Mengalihkan...",
        "success"
      );
      setShowSelesaiModal(false);

      setTimeout(() => navigate("/sewas"), 1500);
    } catch (error: unknown) {
      console.error("❌ Error detail:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyelesaikan sewa";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ PERBAIKAN: Handle hapus sewa
  const handleHapus = async () => {
    if (!sewa) return;

    try {
      setIsProcessing(true);
      const result = await sewaService.delete(sewa.id);
      showToast(
        result.message || "Sewa berhasil dihapus! Mengalihkan...",
        "success"
      );
      setShowHapusModal(false);

      setTimeout(() => navigate("/sewas"), 1500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus sewa";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ PERBAIKAN: Handle WhatsApp action
  const handleWhatsAppAction = async () => {
    if (!sewa || !whatsAppAction) return;

    try {
      setIsProcessing(true);
      let result;

      switch (whatsAppAction) {
        case "reminder":
          result = await whatsappService.sendReminder(sewa.id);
          break;
        case "alert":
          result = await whatsappService.sendAlert(sewa.id);
          break;
        default:
          throw new Error("Aksi WhatsApp tidak valid");
      }

      if (result?.success) {
        showToast("Pesan berhasil dikirim", "success");
      } else {
        showToast(result?.message || "Gagal mengirim pesan", "error");
      }
      setShowWhatsAppModal(false);
      setWhatsAppAction("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengirim pesan";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const openWhatsAppModal = (action: "reminder" | "alert") => {
    setWhatsAppAction(action);
    setShowWhatsAppModal(true);
  };

  useEffect(() => {
    loadSewaData();
  }, [loadSewaData]);

  // ✅ PERBAIKAN: Hitung status yang benar berdasarkan service
  const isSewaAktif =
    sewa?.status === "aktif" || sewa?.status === "Lewat Tempo";
  const isLewatTempo = sewa ? sewaService.isSewaOverdue(sewa) : false;

  // ✅ PERBAIKAN: Debug yang lebih detail
  useEffect(() => {
    if (sewa) {
      console.log("🔍 DETAILED STATUS DEBUG:", {
        // Data dari backend
        statusFromBackend: sewa.status,
        isOverdueBackend: sewa.is_overdue,
        overdueHoursBackend: sewa.overdue_hours,

        // Perhitungan frontend
        isSewaAktif,
        isLewatTempo,
        serviceIsOverdue: sewaService.isSewaOverdue(sewa),
        serviceOverdueHours: sewaService.calculateOverdueHours(sewa),
        serviceEstimatedDenda: sewaService.calculateEstimatedDenda(sewa),

        // Service helper
        statusDisplay: sewaService.getStatusDisplay(sewa),
        canExtend: sewaService.canExtendSewa(sewa),
        canComplete: sewaService.canCompleteSewa(sewa),

        // Timeline
        tglKembali: sewa.tgl_kembali,
        sekarang: new Date(),
        waktuSisa: calculateRemainingTime(sewa.tgl_kembali),
      });
    }
  }, [sewa, isSewaAktif, isLewatTempo]);

  // ✅ PERBAIKAN: Helper function untuk menghitung sisa waktu
  const calculateRemainingTime = (tglKembali: string | Date) => {
    try {
      const end = new Date(tglKembali);
      const now = new Date();
      const diffMs = end.getTime() - now.getTime();

      if (diffMs <= 0) {
        const overdueMs = Math.abs(diffMs);
        const hoursOverdue = Math.floor(overdueMs / (1000 * 60 * 60));
        const minutesOverdue = Math.floor(
          (overdueMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        return {
          text: `+${hoursOverdue}j ${minutesOverdue}m`,
          isOverdue: true,
          hours: hoursOverdue,
          minutes: minutesOverdue,
        };
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return {
        text: hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`,
        isOverdue: false,
        hours,
        minutes,
      };
    } catch (error) {
      return { text: "-", isOverdue: false, hours: 0, minutes: 0 };
    }
  };

  // ✅ Loading state
  if (isLoading) {
    return <Loading message="Memuat data sewa..." />;
  }

  // ✅ Not found state
  if (!sewa) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div
            className={`p-6 rounded-lg mb-6 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border shadow-lg`}
          >
            <h2
              className={`text-xl font-bold mb-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Sewa Tidak Ditemukan
            </h2>
            <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Sewa dengan ID #{id} tidak ditemukan atau telah diselesaikan
            </p>
            <p
              className={`text-sm ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              Data sewa yang sudah selesai dapat dilihat di menu Histories
            </p>
          </div>
          <Link to="/sewas">
            <Button className="w-full sm:w-auto">Kembali ke Daftar Sewa</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ✅ PERBAIKAN: Dapatkan info status dari service
  const statusInfo = sewaService.getStatusDisplay(sewa);
  const estimatedDenda = sewaService.calculateEstimatedDenda(sewa);
  const overdueHours = sewaService.calculateOverdueHours(sewa);

  return (
    <div className="space-y-6 p-4">
      {/* ✅ PERBAIKAN: Header Section dengan status yang benar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/sewas">
            <Button
              variant="outline"
              disabled={isProcessing}
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
          </Link>
          <div>
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Detail Sewa
            </h1>
            <div
              className={`flex items-center gap-2 text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span>ID: #{sewa.id}</span>
              <span>•</span>

              {/* ✅ PERBAIKAN: Tampilkan status dari service helper */}
              <Badge variant={statusInfo.variant}>
                {statusInfo.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <SewaActions
          sewa={sewa}
          onSelesai={() => setShowSelesaiModal(true)}
          onHapus={() => setShowHapusModal(true)}
          onWhatsAppAction={openWhatsAppModal}
          isLewatTempo={isLewatTempo}
          isProcessing={isProcessing}
        />
      </div>

      {/* ✅ PERBAIKAN: Informasi Motor & Lokasi */}
      {motorData && (
        <div
          className={`p-6 rounded-lg border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } shadow-sm`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Informasi Motor & Lokasi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informasi Motor */}
            <div className="space-y-4">
              <h3
                className={`font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Informasi Motor
              </h3>
              <div className="space-y-3">
                <InfoRow label="Plat Nomor" value={motorData.plat_nomor} />
                <InfoRow
                  label="Merk & Model"
                  value={`${motorData.merk} ${motorData.model}`}
                />
                <InfoRow label="Tahun" value={motorData.tahun.toString()} />
                <InfoRow
                  label="Status Motor"
                  value={getMotorStatusBadge(motorData.status)}
                />
                <InfoRow
                  label="Status GPS"
                  value={getGpsStatusBadge(motorData.gps_status)}
                />
              </div>
            </div>

            {/* Lokasi & Tracking */}
            <div className="space-y-4">
              <h3
                className={`font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Lokasi & Tracking
              </h3>
              {motorData.last_known_address ? (
                <div className="space-y-3">
                  <InfoRow
                    label="Alamat Terakhir"
                    value={motorData.last_known_address}
                    valueClass="text-sm"
                  />
                  {motorData.lat && motorData.lng && (
                    <InfoRow
                      label="Koordinat"
                      value={`${motorData.lat.toFixed(
                        6
                      )}, ${motorData.lng.toFixed(6)}`}
                      valueClass="text-xs font-mono"
                    />
                  )}
                  {motorData.last_update && (
                    <InfoRow
                      label="Update Terakhir"
                      value={new Date(motorData.last_update).toLocaleString(
                        "id-ID"
                      )}
                      valueClass="text-xs"
                    />
                  )}
                </div>
              ) : (
                <div
                  className={`text-center py-8 rounded-lg ${
                    isDark
                      ? "bg-gray-700/50 text-gray-400"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  <svg
                    className="w-8 h-8 mx-auto mb-2 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-sm">Tidak ada data lokasi tersedia</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons untuk Motor */}
          <div
            className={`mt-6 pt-4 border-t ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-2">
              {motorData.imei && (
                <Button
                  onClick={() => {
                    showToast("Fitur sync lokasi akan segera tersedia", "info");
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Sync Lokasi
                </Button>
              )}
              <Link to={`/motors/${motorData.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Detail Motor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ✅ PERBAIKAN: Sewa Information */}
      <SewaInfo sewa={sewa} isLewatTempo={isLewatTempo} />

      {/* Modal Selesaikan Sewa */}
      <Modal
        isOpen={showSelesaiModal}
        onClose={() => setShowSelesaiModal(false)}
        title="Selesaikan Sewa"
        size="md"
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
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Konfirmasi Penyelesaian Sewa
            </h3>
            <p
              className={`text-sm mb-4 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Apakah Anda yakin ingin menyelesaikan sewa ini?
            </p>

            {isLewatTempo && (
              <div
                className={`p-3 rounded-lg mb-4 ${
                  isDark
                    ? "bg-red-900/20 text-red-300"
                    : "bg-red-50 text-red-700"
                }`}
              >
                <p className="font-medium">Sewa ini terlambat!</p>
                <p className="text-sm mt-1">
                  Estimasi denda: {formatCurrency(estimatedDenda)}
                </p>
                <p className="text-xs mt-1">
                  Keterlambatan: {overdueHours} jam
                </p>
              </div>
            )}

            <div
              className={`text-xs p-3 rounded-lg ${
                isDark
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <p className="font-medium">Yang akan terjadi:</p>
              <ul className="mt-1 space-y-1 text-left">
                <li>• Sewa akan ditandai sebagai selesai</li>
                <li>• Motor akan kembali tersedia</li>
                <li>• Data akan dipindah ke histories</li>
                <li>• Denda akan dihitung otomatis jika terlambat</li>
              </ul>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowSelesaiModal(false)}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            onClick={handleSelesai}
            loading={isProcessing}
            variant={isLewatTempo ? "warning" : "success"}
          >
            {isLewatTempo ? "Selesaikan (Terlambat)" : "Ya, Selesaikan"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal Hapus Sewa */}
      <Modal
        isOpen={showHapusModal}
        onClose={() => setShowHapusModal(false)}
        title="Hapus Sewa"
        size="md"
      >
        <ModalBody>
          <div className="text-center py-4">
            <div
              className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                isDark ? "bg-red-900/20" : "bg-red-100"
              } mb-4`}
            >
              <svg
                className={`h-6 w-6 ${
                  isDark ? "text-red-400" : "text-red-600"
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
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Konfirmasi Penghapusan
            </h3>
            <p
              className={`text-sm mb-4 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Apakah Anda yakin ingin menghapus sewa ini?
            </p>
            <div
              className={`text-xs p-3 rounded-lg ${
                isDark ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-700"
              }`}
            >
              <p className="font-medium">
                Tindakan ini tidak dapat dibatalkan!
              </p>
              <p className="mt-1">
                Semua data sewa akan dihapus permanen dari sistem
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowHapusModal(false)}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button variant="danger" onClick={handleHapus} loading={isProcessing}>
            Ya, Hapus Sewa
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal WhatsApp Action */}
      <Modal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        title={
          whatsAppAction === "reminder"
            ? "Kirim Pengingat WhatsApp"
            : "Kirim Alert Keterlambatan"
        }
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {whatsAppAction === "reminder"
                ? "Kirim Pengingat ke Penyewa"
                : "Kirim Alert Keterlambatan"}
            </h3>
            <p
              className={`text-sm mb-4 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {whatsAppAction === "reminder"
                ? `Pengingat akan dikirim ke ${sewa.penyewa?.nama} (${sewa.penyewa?.no_whatsapp})`
                : "Alert keterlambatan akan dikirim ke admin terkait"}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowWhatsAppModal(false)}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            onClick={handleWhatsAppAction}
            loading={isProcessing}
            variant="primary"
          >
            Kirim Pesan
          </Button>
        </ModalFooter>
      </Modal>

      {/* Toast Notification */}
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

// ✅ PERBAIKAN: Komponen helper untuk InfoRow
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueClass = "" }) => {
  const { isDark } = useTheme();

  return (
    <div className="flex justify-between items-center py-1">
      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        {label}:
      </span>
      <span
        className={`text-sm font-medium ${valueClass} ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

export default SewaDetail;
