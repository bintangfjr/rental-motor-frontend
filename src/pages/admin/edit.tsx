// src/pages/admin/AdminEdit.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminForm } from "../../components/admin/AdminForm";
import { Button } from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";
import { UpdateAdminData } from "../../types/admin";

const AdminEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [defaultValues, setDefaultValues] = useState<Partial<UpdateAdminData>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        if (!id) return;
        const admin = await adminService.getById(Number(id));
        setDefaultValues({
          nama_lengkap: admin.nama_lengkap,
          username: admin.username,
          email: admin.email,
          is_super_admin: admin.is_super_admin,
          password: "", // Pastikan password kosong
          password_confirmation: "", // Pastikan konfirmasi password kosong
        });
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Gagal mengambil data admin";
        setToast({ message, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmin();
  }, [id]);

  const handleSubmit = async (data: UpdateAdminData) => {
    if (!id) return;
    setIsSubmitting(true);

    // Buat payload yang bersih
    const submitData: UpdateAdminData = {
      nama_lengkap: data.nama_lengkap,
      username: data.username,
      email: data.email,
      is_super_admin: Boolean(data.is_super_admin),
    };

    // Hanya sertakan password jika diisi dan tidak kosong
    if (data.password && data.password.trim() !== "") {
      submitData.password = data.password;
    }
    // JANGAN kirim password_confirmation ke backend

    console.log("Payload dikirim ke backend:", submitData);

    try {
      await adminService.update(Number(id), submitData);
      setToast({ message: "Admin berhasil diperbarui", type: "success" });
      setTimeout(() => navigate("/admins"), 1000);
    } catch (err: any) {
      let errorMessage = "Gagal memperbarui admin";
      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(", ");
        } else {
          errorMessage = err.response.data.message;
        }
      }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate("/admins")}>
          ← Kembali
        </Button>
        <h1 className="text-2xl font-bold">Edit Admin</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <AdminForm<UpdateAdminData>
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          defaultValues={defaultValues}
          isEdit={true}
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

export default AdminEdit;
