import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { sewaService } from "../../services/sewaService";
import { whatsappService } from "../../services/whatsappService";
import { Sewa } from "../../types/sewa";
import { Button } from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import SewaActions from "../../components/sewa/SewaActions";
import SewaInfo from "../../components/sewa/SewaInfo";

const SewaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sewa, setSewa] = useState<Sewa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ✅ Load data sewa
  const loadSewa = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await sewaService.getById(parseInt(id));
      setSewa(data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memuat data sewa";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleSelesai = async () => {
    if (!sewa || !window.confirm("Selesaikan sewa ini?")) return;

    try {
      setIsProcessing(true);
      await sewaService.selesai(sewa.id, {
        tgl_selesai: new Date().toISOString(),
        catatan: "Sewa diselesaikan melalui sistem",
      });
      showToast("Sewa berhasil diselesaikan", "success");
      await loadSewa(); // Reload data setelah selesai
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyelesaikan sewa";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHapus = async () => {
    if (
      !sewa ||
      !window.confirm("Hapus sewa ini? Tindakan ini tidak dapat dibatalkan.")
    )
      return;

    try {
      setIsProcessing(true);
      await sewaService.delete(sewa.id);
      showToast("Sewa berhasil dihapus", "success");
      setTimeout(() => navigate("/sewas"), 1500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus sewa";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppAction = async (action: string) => {
    if (!sewa) return;

    try {
      setIsProcessing(true);
      let result;

      switch (action) {
        case "reminder":
          if (!window.confirm("Kirim pengingat WhatsApp kepada penyewa?"))
            return;
          result = await whatsappService.sendReminder(sewa.id);
          break;
        case "alert":
          if (!window.confirm("Kirim alert keterlambatan ke admin?")) return;
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengirim pesan";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    loadSewa();
  }, [loadSewa]);

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data sewa...</p>
        </div>
      </div>
    );
  }

  // ✅ Not found state
  if (!sewa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">Sewa Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-4">
              Sewa dengan ID #{id} tidak ditemukan atau telah dihapus
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
            <Button variant="outline" disabled={isProcessing}>
              ← Kembali ke Daftar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Sewa</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>ID: #{sewa.id}</span>
              <span>•</span>
              <span>Status: {sewa.status}</span>
              {isLewatTempo && (
                <>
                  <span>•</span>
                  <span className="text-red-600 font-medium">LEWAT TEMPO</span>
                </>
              )}
            </div>
          </div>
        </div>

        <SewaActions
          sewa={sewa}
          onSelesai={handleSelesai}
          onHapus={handleHapus}
          onWhatsAppAction={handleWhatsAppAction}
          isLewatTempo={isLewatTempo}
        />
      </div>

      {/* ✅ Sewa Information - Full Width */}
      <SewaInfo sewa={sewa} isLewatTempo={isLewatTempo} />

      {/* ✅ Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Memproses...</p>
          </div>
        </div>
      )}

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
