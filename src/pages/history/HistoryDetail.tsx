// src/pages/history/HistoryDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { historyService } from "../../services/historyService";
import { History } from "../../types/history";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import Loading from "../../components/ui/Loading";
import Toast from "../../components/ui/Toast";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPhoneNumber,
} from "../../utils/formatters";
import { useTheme } from "../../hooks/useTheme";

const HistoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [history, setHistory] = useState<History | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadHistory = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await historyService.getById(Number(id));
      setHistory(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memuat detail riwayat";
      setError(errorMessage);
      console.error("Error loading history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [id]);

  const handleDelete = async () => {
    if (!history) return;

    setActionLoading(true);
    try {
      await historyService.delete(history.id);
      setToast({
        message: "Riwayat berhasil dihapus",
        type: "success",
      });
      setTimeout(() => {
        navigate("/histories");
      }, 1000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus riwayat";
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "Tepat Waktu" ? (
      <Badge variant="success">Tepat Waktu</Badge>
    ) : (
      <Badge variant="danger">Terlambat</Badge>
    );
  };

  const getPaymentBadge = (pembayaran?: string) => {
    if (!pembayaran) return <Badge variant="secondary">-</Badge>;

    const paymentMap: Record<string, "success" | "warning" | "secondary"> = {
      cash: "success",
      transfer: "warning",
      qris: "warning",
    };

    return (
      <Badge variant={paymentMap[pembayaran.toLowerCase()] || "secondary"}>
        {pembayaran}
      </Badge>
    );
  };

  // Parse additional costs jika ada
  const parseAdditionalCosts = () => {
    if (!history?.additional_costs) return [];

    try {
      const costs = JSON.parse(history.additional_costs);
      return Array.isArray(costs) ? costs : [];
    } catch {
      return [];
    }
  };

  const additionalCosts = parseAdditionalCosts();
  const totalAdditional = additionalCosts.reduce(
    (sum, cost) => sum + (cost.amount || 0),
    0
  );
  const totalHarga =
    (history?.harga || 0) + (history?.denda || 0) + totalAdditional;

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className={`text-6xl mb-4 ${
              isDark ? "text-red-400" : "text-red-600"
            }`}
          >
            ⚠️
          </div>
          <h1
            className={`text-2xl font-bold mb-2 ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Terjadi Kesalahan
          </h1>
          <p
            className={`mb-6 ${
              isDark ? "text-dark-secondary" : "text-gray-600"
            }`}
          >
            {error}
          </p>
          <div className="space-x-2">
            <Button onClick={loadHistory}>Coba Lagi</Button>
            <Button variant="outline" onClick={() => navigate("/histories")}>
              Kembali ke Daftar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className={`text-6xl mb-4 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            ❓
          </div>
          <h1
            className={`text-2xl font-bold mb-2 ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Riwayat Tidak Ditemukan
          </h1>
          <p
            className={`mb-6 ${
              isDark ? "text-dark-secondary" : "text-gray-600"
            }`}
          >
            Riwayat sewa yang Anda cari tidak ditemukan.
          </p>
          <Button onClick={() => navigate("/histories")}>
            Kembali ke Daftar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/histories")}
            >
              ← Kembali
            </Button>
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Detail Riwayat Sewa
            </h1>
          </div>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            ID: {history.id} • Sewa ID: {history.sewa_id}
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Hapus Riwayat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri - Informasi Utama */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Informasi Sewa */}
          <Card>
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Informasi Sewa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Status Penyelesaian
                </label>
                <div className="mt-1">
                  {getStatusBadge(history.status_selesai)}
                </div>
              </div>

              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Metode Pembayaran
                </label>
                <div className="mt-1">
                  {getPaymentBadge(history.pembayaran)}
                </div>
              </div>

              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Tanggal Sewa
                </label>
                <p
                  className={`mt-1 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {formatDateTime(history.tgl_sewa)}
                </p>
              </div>

              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Tanggal Kembali
                </label>
                <p
                  className={`mt-1 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {formatDateTime(history.tgl_kembali)}
                </p>
              </div>

              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Tanggal Selesai
                </label>
                <p
                  className={`mt-1 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {formatDateTime(history.tgl_selesai)}
                </p>
              </div>

              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Durasi Sewa
                </label>
                <p
                  className={`mt-1 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {history.durasi_sewa} {history.satuan_durasi}
                </p>
              </div>

              {history.keterlambatan_menit &&
                history.keterlambatan_menit > 0 && (
                  <div className="md:col-span-2">
                    <label
                      className={`text-sm font-medium ${
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      }`}
                    >
                      Keterlambatan
                    </label>
                    <p
                      className={`mt-1 ${
                        isDark ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      {history.keterlambatan_menit} menit
                    </p>
                  </div>
                )}
            </div>
          </Card>

          {/* Card: Informasi Motor */}
          <Card>
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Informasi Motor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Plat Nomor
                </label>
                <p
                  className={`mt-1 font-mono ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {history.motor_plat}
                </p>
              </div>

              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Merk & Model
                </label>
                <p
                  className={`mt-1 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {history.motor_merk} {history.motor_model}
                </p>
              </div>

              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Tahun
                </label>
                <p
                  className={`mt-1 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {history.tahun_motor}
                </p>
              </div>
            </div>
          </Card>

          {/* Card: Informasi Penyewa */}
          <Card>
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Informasi Penyewa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Nama Penyewa
                </label>
                <p
                  className={`mt-1 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {history.penyewa_nama}
                </p>
              </div>

              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  WhatsApp
                </label>
                <p
                  className={`mt-1 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {formatPhoneNumber(history.penyewa_whatsapp)}
                </p>
              </div>

              <div className="md:col-span-2">
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Jaminan
                </label>
                <p
                  className={`mt-1 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {history.jaminan || "Tidak ada jaminan"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan - Informasi Keuangan & Lainnya */}
        <div className="space-y-6">
          {/* Card: Ringkasan Pembayaran */}
          <Card>
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Ringkasan Pembayaran
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span
                  className={isDark ? "text-dark-secondary" : "text-gray-600"}
                >
                  Harga Sewa:
                </span>
                <span
                  className={isDark ? "text-dark-primary" : "text-gray-900"}
                >
                  {formatCurrency(history.harga)}
                </span>
              </div>

              {history.denda > 0 && (
                <div className="flex justify-between">
                  <span className={isDark ? "text-red-400" : "text-red-600"}>
                    Denda:
                  </span>
                  <span className={isDark ? "text-red-400" : "text-red-600"}>
                    {formatCurrency(history.denda)}
                  </span>
                </div>
              )}

              {additionalCosts.length > 0 && (
                <>
                  <div className="border-t pt-2 mt-2 border-gray-200 dark:border-dark-border">
                    <div className="flex justify-between font-medium">
                      <span
                        className={
                          isDark ? "text-dark-secondary" : "text-gray-600"
                        }
                      >
                        Biaya Tambahan:
                      </span>
                      <span
                        className={
                          isDark ? "text-dark-primary" : "text-gray-900"
                        }
                      >
                        {formatCurrency(totalAdditional)}
                      </span>
                    </div>

                    {/* Detail additional costs */}
                    <div className="mt-2 space-y-1 text-sm">
                      {additionalCosts.map((cost, index) => (
                        <div key={index} className="flex justify-between">
                          <span
                            className={
                              isDark ? "text-dark-muted" : "text-gray-500"
                            }
                          >
                            • {cost.description}:
                          </span>
                          <span
                            className={
                              isDark ? "text-dark-muted" : "text-gray-500"
                            }
                          >
                            {formatCurrency(cost.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="border-t pt-2 mt-2 border-gray-200 dark:border-dark-border">
                <div className="flex justify-between font-bold text-lg">
                  <span
                    className={isDark ? "text-dark-primary" : "text-gray-900"}
                  >
                    Total:
                  </span>
                  <span
                    className={isDark ? "text-dark-primary" : "text-gray-900"}
                  >
                    {formatCurrency(totalHarga)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card: Informasi Admin & Catatan */}
          <Card>
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Informasi Lainnya
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-dark-secondary" : "text-gray-700"
                  }`}
                >
                  Admin Penanggung Jawab
                </label>
                <p
                  className={`mt-1 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {history.admin_nama}
                </p>
              </div>

              {history.catatan && (
                <div>
                  <label
                    className={`text-sm font-medium ${
                      isDark ? "text-dark-secondary" : "text-gray-700"
                    }`}
                  >
                    Catatan Penyelesaian
                  </label>
                  <p
                    className={`mt-1 p-3 rounded-lg ${
                      isDark
                        ? "bg-dark-secondary/30 text-dark-primary"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {history.catatan}
                  </p>
                </div>
              )}

              {history.catatan_tambahan && (
                <div>
                  <label
                    className={`text-sm font-medium ${
                      isDark ? "text-dark-secondary" : "text-gray-700"
                    }`}
                  >
                    Catatan Tambahan
                  </label>
                  <p
                    className={`mt-1 p-3 rounded-lg ${
                      isDark
                        ? "bg-dark-secondary/30 text-dark-primary"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {history.catatan_tambahan}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-dark-border">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-dark-muted" : "text-gray-500"}
                    >
                      Dibuat:
                    </span>
                    <span
                      className={isDark ? "text-dark-muted" : "text-gray-500"}
                    >
                      {formatDateTime(history.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-dark-muted" : "text-gray-500"}
                    >
                      Diupdate:
                    </span>
                    <span
                      className={isDark ? "text-dark-muted" : "text-gray-500"}
                    >
                      {formatDateTime(history.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus Riwayat"
        size="sm"
      >
        <ModalBody>
          <p className={`${isDark ? "text-dark-secondary" : "text-gray-600"}`}>
            Apakah Anda yakin ingin menghapus riwayat sewa ini? Tindakan ini
            tidak dapat dibatalkan.
          </p>
          {history && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${
                isDark ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-700"
              }`}
            >
              <p className="font-medium">Data yang akan dihapus:</p>
              <ul className="mt-1 space-y-1">
                <li>
                  • {history.motor_merk} {history.motor_model} (
                  {history.motor_plat})
                </li>
                <li>• Penyewa: {history.penyewa_nama}</li>
                <li>• Total: {formatCurrency(totalHarga)}</li>
                <li>• Tanggal: {formatDate(history.tgl_selesai)}</li>
              </ul>
            </div>
          )}
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
            loading={actionLoading}
          >
            Ya, Hapus
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

export default HistoryDetail;
