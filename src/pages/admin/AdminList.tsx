// src/pages/admin/AdminList.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { Admin } from "../../types/admin";
import { Button } from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import Toast from "../../components/ui/Toast";

interface ToastState {
  message: string;
  type: "success" | "error";
}

const AdminList: React.FC = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Load semua admin
  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAll(); // token otomatis via interceptor
      setAdmins(data);
    } catch (err: any) {
      console.error("Error loading admins:", err);
      const message = err?.response?.data?.message || "Gagal memuat data admin";
      setToast({ message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // Soft delete admin
  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus admin ini?")) return;

    try {
      await adminService.softDelete(id); // token otomatis
      setToast({ message: "Admin berhasil dihapus", type: "success" });
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      console.error("Error deleting admin:", err);
      const message = err?.response?.data?.message || "Gagal menghapus admin";
      setToast({ message, type: "error" });
    }
  };

  // Restore admin (opsional)
  const handleRestore = async (id: number) => {
    try {
      await adminService.restore(id); // token otomatis
      setToast({ message: "Admin berhasil dipulihkan", type: "success" });
      loadAdmins();
    } catch (err: any) {
      console.error("Error restoring admin:", err);
      const message = err?.response?.data?.message || "Gagal memulihkan admin";
      setToast({ message, type: "error" });
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daftar Admin</h1>
        <Button onClick={() => navigate("/admins/create")}>Tambah Admin</Button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Lengkap
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap">{admin.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{admin.nama_lengkap}</td>
                <td className="px-6 py-4 whitespace-nowrap">{admin.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {admin.is_super_admin ? "Super Admin" : "Admin"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admins/${admin.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(admin.id)}
                  >
                    Hapus
                  </Button>
                  {admin.deleted_at && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleRestore(admin.id)}
                    >
                      Pulihkan
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default AdminList;
