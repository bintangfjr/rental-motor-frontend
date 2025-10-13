import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { penyewaService } from "../../services/penyewaService";
import { CreatePenyewaData } from "../../types/penyewa";
import { PenyewaForm } from "../../components/penyewa/PenyewaForm";
import { Button } from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";

export const PenyewaCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleSubmit = async (data: CreatePenyewaData) => {
    setIsLoading(true);
    try {
      // Normalisasi nomor WhatsApp sebelum disimpan
      let normalizedNoWhatsapp = data.no_whatsapp.trim();

      // Jika nomor diawali dengan 0, ubah menjadi 62
      if (normalizedNoWhatsapp.startsWith("0")) {
        normalizedNoWhatsapp = "62" + normalizedNoWhatsapp.substring(1);
      }
      // Jika nomor diawali dengan +62, hapus tanda +
      else if (normalizedNoWhatsapp.startsWith("+62")) {
        normalizedNoWhatsapp = normalizedNoWhatsapp.substring(1);
      }

      const submitData: CreatePenyewaData = {
        ...data,
        no_whatsapp: normalizedNoWhatsapp,
        // foto_ktp sudah berupa base64 string dari PenyewaForm
      };

      // Panggil service create - hanya 1 parameter
      await penyewaService.create(submitData);

      setToast({
        message: "Penyewa berhasil ditambahkan",
        type: "success",
      });

      // Redirect setelah delay
      setTimeout(() => navigate("/penyewas"), 1500);
    } catch (error: unknown) {
      console.error("Error creating penyewa:", error);

      // Handle error yang lebih spesifik
      let errorMessage = "Gagal menambahkan penyewa";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/penyewas")}
            disabled={isLoading}
          >
            ← Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Tambah Penyewa Baru
          </h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <PenyewaForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

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

export default PenyewaCreate;
