// src/pages/motor/MotorCreate.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MotorForm } from "../../components/motor/MotorForm";
import { Button } from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { motorService } from "../../services/motorService";
import { CreateMotorData } from "../../types/motor";
import { AxiosError } from "axios"; // Jika motorService menggunakan axios

interface ToastState {
  message: string;
  type: "success" | "error";
}

const MotorCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleSubmit = async (data: CreateMotorData) => {
    setIsSubmitting(true);
    try {
      console.log("Payload create motor:", data); // debug payload
      await motorService.create(data);
      setToast({ message: "Motor berhasil ditambahkan", type: "success" });

      // Navigasi setelah 1 detik agar toast terbaca
      setTimeout(() => navigate("/motors"), 1000);
    } catch (err: unknown) {
      let errorMessage = "Gagal menambahkan motor";

      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }

      console.error("Error create motor:", err);
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header dan tombol kembali */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate("/motors")}>
          ← Kembali
        </Button>
        <h1 className="text-2xl font-bold">Tambah Motor</h1>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <MotorForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>

      {/* Toast message */}
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

export default MotorCreate;
