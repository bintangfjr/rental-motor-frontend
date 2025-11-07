import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { penyewaService } from "../../services/penyewaService";
import { Penyewa } from "../../types/penyewa";
import { Button } from "../../components/ui/Button";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { useTheme } from "../../hooks/useTheme";
import { KTPImageWithFallback } from "../../components/penyewa/KTPImageWithFallback";
import { PenyewaHistory } from "../../components/penyewa/PenyewaHistory";

export const PenyewaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [penyewa, setPenyewa] = useState<Penyewa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // State untuk modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPenyewa = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const penyewaData = await penyewaService.getById(Number(id));
      setPenyewa(penyewaData);
    } catch (error) {
      console.error("Error loading penyewa:", error);
      setToast({
        message: "Gagal memuat data penyewa",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPenyewa();
  }, [loadPenyewa]);

  const handleToggleBlacklist = async () => {
    if (!penyewa) return;

    setActionLoading(true);
    try {
      const updatedPenyewa = await penyewaService.toggleBlacklist(penyewa.id);
      setPenyewa(updatedPenyewa);
      setToast({
        message: `Penyewa ${
          updatedPenyewa.is_blacklisted ? "ditambahkan ke" : "dihapus dari"
        } blacklist`,
        type: "success",
      });
      setShowBlacklistModal(false);
    } catch (error) {
      console.error("Error toggling blacklist:", error);
      setToast({
        message: "Gagal mengubah status blacklist",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!penyewa) return;

    setActionLoading(true);
    try {
      await penyewaService.delete(penyewa.id);
      setToast({
        message: "Penyewa berhasil dihapus",
        type: "success",
      });
      setShowDeleteModal(false);
      setTimeout(() => navigate("/penyewas"), 1000);
    } catch (error) {
      console.error("Error deleting penyewa:", error);
      setToast({
        message: "Gagal menghapus penyewa",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/penyewas/edit/${penyewa?.id}`);
  };

  const handleBack = () => {
    navigate("/penyewas");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className={`text-lg ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          Memuat data penyewa...
        </div>
      </div>
    );
  }

  if (!penyewa) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div
            className={`text-lg mb-4 ${
              isDark ? "text-red-400" : "text-red-600"
            }`}
          >
            Penyewa tidak ditemukan
          </div>
          <Button variant="outline" onClick={handleBack}>
            Kembali ke Daftar Penyewa
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
            onClick={handleBack}
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
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Detail Penyewa
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button
            variant={penyewa.is_blacklisted ? "success" : "secondary"}
            onClick={() => setShowBlacklistModal(true)}
          >
            {penyewa.is_blacklisted
              ? "Hapus dari Blacklist"
              : "Tambah ke Blacklist"}
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Hapus
          </Button>
        </div>
      </div>

      {/* Informasi Penyewa Card */}
      <div
        className={`rm-card ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`px-6 py-4 border-b ${
            isDark ? "border-dark-border" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Informasi Penyewa
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Informasi Utama */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? "text-dark-secondary" : "text-gray-700"
                    }`}
                  >
                    Nama Lengkap
                  </label>
                  <p
                    className={`text-lg font-semibold ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {penyewa.nama}
                  </p>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? "text-dark-secondary" : "text-gray-700"
                    }`}
                  >
                    Nomor WhatsApp
                  </label>
                  <p
                    className={`text-lg ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {penyewa.no_whatsapp}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? "text-dark-secondary" : "text-gray-700"
                    }`}
                  >
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      penyewa.is_blacklisted
                        ? isDark
                          ? "bg-red-900/20 text-red-300"
                          : "bg-red-100 text-red-800"
                        : isDark
                        ? "bg-green-900/20 text-green-300"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {penyewa.is_blacklisted ? "Blacklisted" : "Aktif"}
                  </span>
                </div>

                {penyewa.alamat && (
                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      }`}
                    >
                      Alamat
                    </label>
                    <p
                      className={`whitespace-pre-wrap ${
                        isDark ? "text-dark-primary" : "text-gray-900"
                      }`}
                    >
                      {penyewa.alamat}
                    </p>
                  </div>
                )}
              </div>

              {/* Informasi Tambahan */}
              <div
                className={`pt-4 border-t ${
                  isDark ? "border-dark-border" : "border-gray-200"
                }`}
              >
                <h3
                  className={`text-md font-medium mb-3 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  Informasi Tambahan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label
                      className={`block mb-1 ${
                        isDark ? "text-dark-secondary" : "text-gray-600"
                      }`}
                    >
                      Tanggal Dibuat
                    </label>
                    <p
                      className={isDark ? "text-dark-primary" : "text-gray-900"}
                    >
                      {new Date(penyewa.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <label
                      className={`block mb-1 ${
                        isDark ? "text-dark-secondary" : "text-gray-600"
                      }`}
                    >
                      Terakhir Diupdate
                    </label>
                    <p
                      className={isDark ? "text-dark-primary" : "text-gray-900"}
                    >
                      {new Date(penyewa.updated_at).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto KTP */}
            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-3 ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Foto KTP
                </label>
                <KTPImageWithFallback
                  src={penyewa.foto_ktp || null}
                  alt="Foto KTP"
                  className={`w-full h-64 object-contain border rounded-lg ${
                    isDark
                      ? "border-dark-border bg-dark-secondary/50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Komponen History Sewa */}
      {penyewa && <PenyewaHistory penyewaId={penyewa.id} />}

      {/* Modal Hapus Penyewa */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hapus Penyewa"
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
              Apakah Anda yakin ingin menghapus penyewa{" "}
              <strong>{penyewa.nama}</strong>?
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
                Semua data penyewa termasuk riwayat sewa akan dihapus permanen.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={actionLoading}
          >
            Ya, Hapus
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal Blacklist */}
      <Modal
        isOpen={showBlacklistModal}
        onClose={() => setShowBlacklistModal(false)}
        title={
          penyewa.is_blacklisted
            ? "Hapus dari Blacklist"
            : "Tambah ke Blacklist"
        }
        size="md"
      >
        <ModalBody>
          <div className="text-center py-4">
            <div
              className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                isDark
                  ? penyewa.is_blacklisted
                    ? "bg-green-900/20"
                    : "bg-yellow-900/20"
                  : penyewa.is_blacklisted
                  ? "bg-green-100"
                  : "bg-yellow-100"
              } mb-4`}
            >
              <svg
                className={`h-6 w-6 ${
                  isDark
                    ? penyewa.is_blacklisted
                      ? "text-green-400"
                      : "text-yellow-400"
                    : penyewa.is_blacklisted
                    ? "text-green-600"
                    : "text-yellow-600"
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
              {penyewa.is_blacklisted
                ? "Hapus dari Blacklist"
                : "Tambah ke Blacklist"}
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-dark-secondary" : "text-gray-600"
              } mb-4`}
            >
              {penyewa.is_blacklisted
                ? `Apakah Anda yakin ingin menghapus ${penyewa.nama} dari blacklist?`
                : `Apakah Anda yakin ingin menambahkan ${penyewa.nama} ke blacklist?`}
            </p>
            <div
              className={`text-xs p-3 rounded-lg ${
                isDark
                  ? "bg-dark-secondary/30 text-dark-muted"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              <p className="font-medium">
                {penyewa.is_blacklisted
                  ? "Penyewa akan dapat melakukan penyewaan kembali."
                  : "Penyewa tidak akan dapat melakukan penyewaan baru."}
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowBlacklistModal(false)}
            disabled={actionLoading}
          >
            Batal
          </Button>
          <Button
            variant={penyewa.is_blacklisted ? "success" : "secondary"}
            onClick={handleToggleBlacklist}
            isLoading={actionLoading}
          >
            {penyewa.is_blacklisted
              ? "Ya, Hapus dari Blacklist"
              : "Ya, Tambah ke Blacklist"}
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

export default PenyewaDetail;
