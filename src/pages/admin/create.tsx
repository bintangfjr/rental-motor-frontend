// src/pages/admin/Create.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminForm } from '../../components/admin/AdminForm';
import { Button } from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { adminService } from '../../services/adminService';
import { CreateAdminData } from '../../types/admin';

const AdminCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (data: CreateAdminData) => {
    setIsSubmitting(true);

    try {
      // Pastikan password_confirmation sesuai dengan password
      const payload: CreateAdminData = {
        nama_lengkap: data.nama_lengkap,
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation || data.password, // Gunakan confirmation jika ada, fallback ke password
        is_super_admin: Boolean(data.is_super_admin),
      };

      console.log('Payload dikirim ke backend:', payload);

      await adminService.create(payload);

      setToast({ message: 'Admin berhasil ditambahkan', type: 'success' });

      // Navigasi ke halaman list setelah 1.5 detik
      setTimeout(() => navigate('/admins'), 1500);
    } catch (err: any) {
      console.error('Gagal membuat admin:', err);

      // Handle error response dengan lebih baik
      let errorMessage = 'Gagal membuat admin';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle berbagai format error dari backend
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
        } else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.error('Error details:', errorMessage);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admins');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            ← Kembali ke Daftar Admin
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Admin Baru</h1>
        </div>
      </div>

          {/* Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <AdminForm<CreateAdminData>
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      isEdit={false} // Tentukan ini adalah form create
    />
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === 'error' ? 5000 : 3000}
        />
      )}
    </div>
  );
};

export default AdminCreate;