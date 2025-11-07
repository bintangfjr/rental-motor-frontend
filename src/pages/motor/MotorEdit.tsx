// src/pages/motor/MotorEdit.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motorService } from "../../services/motorService";
import { Motor, MotorWithIopgps } from "../../types/motor";
import { MotorForm } from "../../components/motor/MotorForm";
import { Button } from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import Toast from "../../components/ui/Toast";
import { useTheme } from "../../hooks/useTheme";

interface ToastState {
  message: string;
  type: "success" | "error";
}

// Interface untuk update motor data - sesuai dengan backend requirements
interface UpdateMotorData {
  plat_nomor?: string;
  merk?: string;
  model?: string;
  tahun?: number;
  harga?: number;
  no_gsm?: string;
  imei?: string;
  status?: "tersedia" | "disewa" | "perbaikan" | "pending_perbaikan";
  device_id?: string;
}

const MotorEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [motor, setMotor] = useState<Motor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const loadMotor = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data: MotorWithIopgps = await motorService.getById(parseInt(id));
        setMotor(data);
      } catch {
        setToast({ message: "Gagal memuat data motor", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    loadMotor();
  }, [id]);

  const handleSubmit = async (data: UpdateMotorData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      // Hanya kirim field yang benar-benar diperlukan oleh backend
      const updateData: UpdateMotorData = {
        plat_nomor: data.plat_nomor,
        merk: data.merk,
        model: data.model,
        tahun: data.tahun,
        harga: data.harga,
        imei: data.imei,
        status: data.status,
        // Jangan kirim field yang tidak diperlukan atau bisa menyebabkan error
      };

      await motorService.update(parseInt(id), updateData);
      setToast({ message: "Motor berhasil diperbarui", type: "success" });

      setTimeout(() => navigate("/motors"), 1000);
    } catch (err: unknown) {
      let errorMessage = "Gagal memperbarui motor";

      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }

      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/motors");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loading />
      </div>
    );
  }

  if (!motor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/motors")}>
            ← Kembali
          </Button>
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Edit Motor
          </h1>
        </div>
        <div
          className={`rm-card p-6 rounded-lg text-center ${
            isDark ? "text-dark-secondary" : "text-gray-500"
          }`}
        >
          <p>Motor tidak ditemukan</p>
          <Button
            variant="outline"
            onClick={() => navigate("/motors")}
            className="mt-4"
          >
            Kembali ke Daftar Motor
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
          <Button variant="outline" onClick={handleCancel}>
            ← Kembali
          </Button>
          <div>
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Edit Motor
            </h1>
            <p className={isDark ? "text-dark-secondary" : "text-gray-600"}>
              Perbarui informasi motor
            </p>
          </div>
        </div>
        <div className={isDark ? "text-dark-muted" : "text-gray-500"}>
          ID: {motor.id}
        </div>
      </div>

      {/* Form */}
      <div className="rm-card p-6 rounded-lg border">
        <MotorForm
          motor={motor}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>

      {/* Toast */}
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

export default MotorEdit;
