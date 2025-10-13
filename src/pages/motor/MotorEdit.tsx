// src/pages/motor/MotorEdit.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motorService } from "../../services/motorService";
import { Motor, UpdateMotorData } from "../../types/motor";
import { MotorForm } from "../../components/motor/MotorForm";
import { Button } from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import Toast from "../../components/ui/Toast";
import { AxiosError } from "axios"; // jika motorService menggunakan axios

interface ToastState {
  message: string;
  type: "success" | "error";
}

const MotorEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [motor, setMotor] = useState<Motor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const loadMotor = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data: Motor = await motorService.getById(parseInt(id));
        setMotor(data);
      } catch (err: unknown) {
        console.error("Error loading motor:", err);
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
      await motorService.update(parseInt(id), data);
      setToast({ message: "Motor berhasil diperbarui", type: "success" });
      setTimeout(() => navigate("/motors"), 1000);
    } catch (err: unknown) {
      let errorMessage = "Gagal memperbarui motor";

      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }

      console.error("Error updating motor:", err);
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;
  if (!motor) return <div>Motor tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate("/motors")}>
          ← Kembali
        </Button>
        <h1 className="text-2xl font-bold">Edit Motor</h1>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
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
