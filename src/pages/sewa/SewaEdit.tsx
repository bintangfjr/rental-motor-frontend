import React, { useState, useEffect, lazy } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { sewaService } from "../../services/sewaService";
import { motorService } from "../../services/motorService";
import { penyewaService } from "../../services/penyewaService";
import { Sewa, UpdateSewaData } from "../../types/sewa";
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
  alamat?: string;
  is_blacklisted: boolean;
}

const SewaEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sewa, setSewa] = useState<Sewa | null>(null);
  const [motors, setMotors] = useState<Motor[]>([]);
  const [penyewas, setPenyewas] = useState<Penyewa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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
  }, [id]); // Hanya id sebagai dependency

  const handleSubmit = async (data: UpdateSewaData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await sewaService.update(parseInt(id), data);
      setToast({ message: "Sewa berhasil diperbarui", type: "success" });
      setTimeout(() => navigate("/sewas"), 1000);
    } catch (error: unknown) {
      console.error("Error updating sewa:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memperbarui sewa";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!sewa) {
    return (
      <div className="text-center py-8">
        <p>Sewa tidak ditemukan</p>
        <Button onClick={() => navigate("/sewas")} className="mt-4">
          Kembali ke Daftar Sewa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate("/sewas")}>
          ← Kembali
        </Button>
        <h1 className="text-2xl font-bold">Edit Sewa</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <React.Suspense fallback={<div>Loading form...</div>}>
          <SewaForm
            sewa={sewa}
            motors={motors}
            penyewas={penyewas}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </React.Suspense>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default SewaEdit;
