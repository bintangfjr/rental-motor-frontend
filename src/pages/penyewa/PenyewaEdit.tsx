import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { penyewaService } from "../../services/penyewaService";
import { Penyewa, UpdatePenyewaData } from "../../types/penyewa";
import { PenyewaForm } from "../../components/penyewa/PenyewaForm";
import { Button } from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import Toast from "../../components/ui/Toast";

const PenyewaEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [penyewa, setPenyewa] = useState<Penyewa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const loadPenyewa = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await penyewaService.getById(parseInt(id));
        setPenyewa(data);
      } catch (error: unknown) {
        console.error("Error loading penyewa:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Gagal memuat data penyewa";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    loadPenyewa();
  }, [id]);

  const handleSubmit = async (data: UpdatePenyewaData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      // Pastikan no_whatsapp tidak undefined
      let normalizedNoWhatsapp = data.no_whatsapp?.trim() || "";

      // Normalisasi nomor WhatsApp
      if (normalizedNoWhatsapp.startsWith("0")) {
        normalizedNoWhatsapp = "62" + normalizedNoWhatsapp.substring(1);
      } else if (normalizedNoWhatsapp.startsWith("+62")) {
        normalizedNoWhatsapp = normalizedNoWhatsapp.substring(1);
      }

      const submitData: UpdatePenyewaData = {
        ...data,
        no_whatsapp: normalizedNoWhatsapp,
        // foto_ktp sudah termasuk dalam data dari PenyewaForm
      };

      // HANYA 2 PARAMETER - sesuaikan dengan service yang sudah diperbaiki
      await penyewaService.update(parseInt(id), submitData);

      setToast({ message: "Penyewa berhasil diperbarui", type: "success" });
      setTimeout(() => navigate("/penyewas"), 1000);
    } catch (error: unknown) {
      console.error("Error updating penyewa:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memperbarui penyewa";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format nomor WhatsApp untuk form (ubah 62 menjadi 0 jika perlu)
  const formatPenyewaForForm = (penyewaData: Penyewa): Penyewa => {
    let formattedNoWhatsapp = penyewaData.no_whatsapp;

    // Jika nomor disimpan sebagai 62 di database, ubah ke 0 untuk form
    if (
      formattedNoWhatsapp.startsWith("62") &&
      formattedNoWhatsapp.length >= 11
    ) {
      formattedNoWhatsapp = "0" + formattedNoWhatsapp.substring(2);
    }

    return {
      ...penyewaData,
      no_whatsapp: formattedNoWhatsapp,
    };
  };

  if (isLoading) return <Loading />;

  if (!penyewa) {
    return (
      <div className="text-center py-8">
        <p>Penyewa tidak ditemukan</p>
        <Button onClick={() => navigate("/penyewas")} className="mt-4">
          Kembali ke Daftar Penyewa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/penyewas")}>
            ← Kembali
          </Button>
          <h1 className="text-2xl font-bold">Edit Penyewa</h1>
        </div>
        <Button variant="outline" onClick={() => navigate(`/penyewas/${id}`)}>
          Lihat Detail
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <PenyewaForm
          penyewa={formatPenyewaForForm(penyewa)}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
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

export default PenyewaEdit;
