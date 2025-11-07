import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { sewaService } from "../../services/sewaService";
import { whatsappService } from "../../services/whatsappService";
import { Sewa } from "../../types/sewa";
import { Button } from "../../components/ui/Button";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import SewaActions from "../../components/sewa/SewaActions";
import SewaInfo from "../../components/sewa/SewaInfo";
import { useTheme } from "../../hooks/useTheme";

const SewaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [sewa, setSewa] = useState<Sewa | null>(null);
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

  // ✅ Load data sewa dengan handling 404
  const loadSewa = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await sewaService.getById(parseInt(id));
      setSewa(data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memuat data sewa";

      // ✅ TANGANI ERROR 404 KHUSUS - data sudah dihapus karena selesai
      if (
        errorMessage.includes("tidak ditemukan") ||
        errorMessage.includes("sudah selesai")
      ) {
        showToast("Sewa sudah diselesaikan dan data tidak tersedia", "success");
        // Redirect setelah beberapa detik
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

  // ✅ FIXED: Handle selesai sewa - TIDAK memanggil loadSewa() lagi
  const handleSelesai = async () => {
    if (!sewa) return;

    try {
      setIsProcessing(true);
      await sewaService.selesai(sewa.id, {
        tgl_selesai: new Date().toISOString(),
        catatan: "Sewa diselesaikan melalui sistem",
      });

      showToast("Sewa berhasil diselesaikan! Mengalihkan...", "success");
      setShowSelesaiModal(false);

      // ✅ LANGSUNG REDIRECT - jangan panggil loadSewa() karena data sudah dihapus
      setTimeout(() => navigate("/sewas"), 1500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyelesaikan sewa";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ FIXED: Handle hapus sewa - TIDAK memanggil loadSewa() lagi
  const handleHapus = async () => {
    if (!sewa) return;

    try {
      setIsProcessing(true);
      await sewaService.delete(sewa.id);
      showToast("Sewa berhasil dihapus! Mengalihkan...", "success");
      setShowHapusModal(false);

      // ✅ LANGSUNG REDIRECT
      setTimeout(() => navigate("/sewas"), 1500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus sewa";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

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
          return;
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
    loadSewa();
  }, [loadSewa]);

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
              isDark ? "border-blue-400" : "border-blue-600"
            }`}
          ></div>
          <p className={isDark ? "text-dark-secondary" : "text-gray-600"}>
            Memuat data sewa...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Not found state - handle case ketika data tidak ditemukan dari awal
  if (!sewa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className={`p-4 rounded-lg mb-4 ${
              isDark ? "bg-red-900/20 text-red-300" : "bg-red-100 text-red-600"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-2 ${
                isDark ? "text-red-300" : "text-red-600"
              }`}
            >
              Sewa Tidak Ditemukan
            </h2>
            <p
              className={`mb-4 ${isDark ? "text-dark-muted" : "text-gray-600"}`}
            >
              Sewa dengan ID #{id} tidak ditemukan atau telah diselesaikan
            </p>
          </div>
          <Link to="/sewas">
            <Button>Kembali ke Daftar Sewa</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isSewaAktif = sewa.status === "aktif";
  const isLewatTempo = isSewaAktif && new Date(sewa.tgl_kembali) < new Date();

  return (
    <div className="space-y-6">
      {/* ✅ Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
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
              Kembali ke Daftar
            </Button>
          </Link>
          <div>
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Detail Sewa
            </h1>
            <div
              className={`flex items-center gap-2 text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              }`}
            >
              <span>ID: #{sewa.id}</span>
              <span>•</span>
              <span>Status: {sewa.status}</span>
              {isLewatTempo && (
                <>
                  <span>•</span>
                  <span
                    className={`font-medium ${
                      isDark ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    LEWAT TEMPO
                  </span>
                </>
              )}
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

      {/* ✅ Sewa Information - Full Width */}
      <SewaInfo sewa={sewa} isLewatTempo={isLewatTempo} />

      {/* ✅ Modal Selesaikan Sewa */}
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
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Konfirmasi Penyelesaian Sewa
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              } mb-4`}
            >
              Apakah Anda yakin ingin menyelesaikan sewa ini?
            </p>
            <div
              className={`text-xs p-3 rounded-lg ${
                isDark
                  ? "bg-dark-secondary/30 text-dark-muted"
                  : "bg-green-50 text-green-700"
              }`}
            >
              <p className="font-medium">Sewa akan ditandai sebagai selesai</p>
              <p className="mt-1">Motor akan kembali tersedia untuk disewa</p>
              <p className="mt-1 font-semibold">
                Data akan dipindah ke histories dan dihapus dari daftar sewa
                aktif
              </p>
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
          <Button onClick={handleSelesai} loading={isProcessing}>
            Ya, Selesaikan Sewa
          </Button>
        </ModalFooter>
      </Modal>

      {/* ✅ Modal Hapus Sewa */}
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
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Konfirmasi Penghapusan
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              } mb-4`}
            >
              Apakah Anda yakin ingin menghapus sewa ini?
            </p>
            <div
              className={`text-xs p-3 rounded-lg ${
                isDark
                  ? "bg-dark-secondary/30 text-dark-muted"
                  : "bg-red-50 text-red-700"
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

      {/* ✅ Modal WhatsApp Action */}
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
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              {whatsAppAction === "reminder"
                ? "Kirim Pengingat ke Penyewa"
                : "Kirim Alert ke Admin"}
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              } mb-4`}
            >
              {whatsAppAction === "reminder"
                ? "Pengingat akan dikirim ke nomor WhatsApp penyewa"
                : "Alert keterlambatan akan dikirim ke admin"}
            </p>
            <div
              className={`text-xs p-3 rounded-lg ${
                isDark
                  ? "bg-dark-secondary/30 text-dark-muted"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              <p className="font-medium">
                {whatsAppAction === "reminder"
                  ? "Pastikan nomor WhatsApp penyewa aktif"
                  : "Pastikan pengaturan WhatsApp admin sudah benar"}
              </p>
            </div>
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
          <Button onClick={handleWhatsAppAction} loading={isProcessing}>
            Ya, Kirim Pesan
          </Button>
        </ModalFooter>
      </Modal>

      {/* ✅ Toast Notification */}
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

export default SewaDetail;
