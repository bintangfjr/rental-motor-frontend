import React, { useState } from "react";
import {
  settingsService,
  ChangePasswordData,
  DeleteAccountData,
} from "../../services/settingsService";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";

const SecuritySettings: React.FC = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingPassword(true);

    try {
      const formData = new FormData(e.currentTarget);
      const passwordData: ChangePasswordData = {
        current_password: formData.get("current_password") as string,
        password: formData.get("password") as string,
        password_confirmation: formData.get("password_confirmation") as string,
      };

      await settingsService.changePassword(passwordData);
      setToast({ message: "Password berhasil diubah", type: "success" });
      e.currentTarget.reset();
    } catch (error: unknown) {
      console.error("Error changing password:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengubah password";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDeletingAccount(true);

    try {
      const formData = new FormData(e.currentTarget);
      const deleteData: DeleteAccountData = {
        password: formData.get("delete_password") as string,
      };

      await settingsService.deleteAccount(deleteData);
      setToast({ message: "Akun berhasil dihapus", type: "success" });
      // Redirect to login or home page after account deletion
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: unknown) {
      console.error("Error deleting account:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus akun";
      setToast({ message: errorMessage, type: "error" });
      setShowDeleteModal(false);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Keamanan Akun</h1>
        <p className="text-gray-600">Kelola keamanan dan privasi akun Anda</p>
      </div>

      {/* Change Password Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Ubah Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input
            label="Password Saat Ini"
            type="password"
            name="current_password"
            required
          />

          <Input
            label="Password Baru"
            type="password"
            name="password"
            required
            minLength={8}
            helperText="Password minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka"
          />

          <Input
            label="Konfirmasi Password Baru"
            type="password"
            name="password_confirmation"
            required
            minLength={8}
          />

          <Button type="submit" isLoading={isChangingPassword}>
            Ubah Password
          </Button>
        </form>
      </div>

      {/* Delete Account Section */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Hapus Akun</h2>
        <p className="text-red-600 mb-4">
          Tindakan ini tidak dapat dibatalkan. Semua data yang terkait dengan
          akun ini akan dihapus secara permanen.
        </p>

        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Hapus Akun Saya
        </Button>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hapus Akun"
        size="md"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-red-600">
            Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat
            dibatalkan.
          </p>

          <Input
            label="Masukkan password Anda untuk konfirmasi"
            type="password"
            name="delete_password"
            required
          />

          <div className="flex space-x-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isDeletingAccount}
            >
              Hapus Akun
            </Button>
          </div>
        </form>
      </Modal>

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

export default SecuritySettings;
