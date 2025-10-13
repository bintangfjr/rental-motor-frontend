import React, { useState, useEffect, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { sewaService } from "../../services/sewaService";
import { motorService } from "../../services/motorService";
import { penyewaService } from "../../services/penyewaService";
import { CreateSewaData, Sewa } from "../../types/sewa";
import { Button } from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [motors, setMotors] = useState<Motor[]>([]);
  const [penyewas, setPenyewas] = useState<Penyewa[]>([]);
  const [activeSewas, setActiveSewas] = useState<Sewa[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

  // Filter penyewa yang tidak memiliki sewa aktif dan tidak blacklisted
  const getAvailablePenyewas = () => {
    const activePenyewaIds = activeSewas
      .filter((sewa) => sewa.status === "aktif")
      .map((sewa) => sewa.penyewa_id);

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

      setToast({
        message: "Sewa berhasil ditambahkan",
        type: "success",
      });

      setTimeout(() => navigate("/sewas"), 1500);
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

  const handleCancel = () => {
    navigate("/sewas");
  };

  const availableMotors = getAvailableMotors();
  const availablePenyewas = getAvailablePenyewas();

  return (
    <div className="space-y-6">
      {/* ✅ HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            ← Kembali ke Daftar Sewa
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tambah Sewa Baru
            </h1>
            <p className="text-gray-600">
              Isi form berikut untuk membuat sewa baru
            </p>
          </div>
        </div>
      </div>

      {/* ✅ FORM SECTION */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        {isLoadingData ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data motor dan penyewa...</p>
            </div>
          </div>
        ) : (
          <React.Suspense
            fallback={
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Memuat form sewa...</span>
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

      {/* ✅ WARNING SECTION - Hanya muncul jika tidak ada motor/penyewa tersedia */}
      {!isLoadingData &&
        (availableMotors.length === 0 || availablePenyewas.length === 0) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">⚠ Perhatian</h3>
            <div className="text-sm text-red-700 space-y-2">
              {availableMotors.length === 0 && (
                <p>
                  <strong>Tidak ada motor yang tersedia</strong> untuk disewa.
                  Semua motor sedang dalam penyewaan aktif atau dalam perbaikan.
                </p>
              )}
              {availablePenyewas.length === 0 && (
                <p>
                  <strong>Tidak ada penyewa yang tersedia</strong>. Semua
                  penyewa sedang dalam penyewaan aktif atau dalam daftar hitam.
                </p>
              )}
              <div className="flex space-x-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => navigate("/motors")}
                  variant="outline"
                >
                  Kelola Motor
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/penyewas")}
                  variant="outline"
                >
                  Kelola Penyewa
                </Button>
              </div>
            </div>
          </div>
        )}

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
