import React, { useState } from "react";
import {
  settingsService,
  ChangePasswordData,
  DeleteAccountData,
} from "../../services/settingsService";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Modal, ModalBody, ModalFooter } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { useTheme } from "../../hooks/useTheme";

const SecuritySettings: React.FC = () => {
  const { isDark } = useTheme();
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
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          Keamanan Akun
        </h1>
        <p className={isDark ? "text-dark-secondary" : "text-gray-600"}>
          Kelola keamanan dan privasi akun Anda
        </p>
      </div>

      {/* Change Password Section */}
      <Card className="p-6">
        <h2
          className={`text-lg font-semibold mb-4 ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          Ubah Password
        </h2>
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
      </Card>

      {/* Security Tips */}
      <Card className="p-6">
        <h2
          className={`text-lg font-semibold mb-4 ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          Tips Keamanan
        </h2>
        <div className="space-y-3">
          <div
            className={`flex items-start space-x-3 p-3 rounded-lg ${
              isDark ? "bg-blue-900/20" : "bg-blue-50"
            }`}
          >
            <div
              className={`p-1 rounded-full mt-1 ${
                isDark ? "bg-blue-400" : "bg-blue-600"
              }`}
            >
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p
                className={`font-medium text-sm ${
                  isDark ? "text-blue-300" : "text-blue-700"
                }`}
              >
                Gunakan password yang kuat
              </p>
              <p
                className={`text-xs ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Kombinasi huruf besar, kecil, angka, dan simbol
              </p>
            </div>
          </div>

          <div
            className={`flex items-start space-x-3 p-3 rounded-lg ${
              isDark ? "bg-yellow-900/20" : "bg-yellow-50"
            }`}
          >
            <div
              className={`p-1 rounded-full mt-1 ${
                isDark ? "bg-yellow-400" : "bg-yellow-600"
              }`}
            >
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p
                className={`font-medium text-sm ${
                  isDark ? "text-yellow-300" : "text-yellow-700"
                }`}
              >
                Jangan bagikan password
              </p>
              <p
                className={`text-xs ${
                  isDark ? "text-yellow-400" : "text-yellow-600"
                }`}
              >
                Password bersifat pribadi dan rahasia
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Account Section */}
      <Card
        className={`p-6 border-2 ${
          isDark
            ? "bg-red-900/10 border-red-800/30"
            : "bg-red-50 border-red-200"
        }`}
      >
        <h2
          className={`text-lg font-semibold mb-2 ${
            isDark ? "text-red-400" : "text-red-800"
          }`}
        >
          Hapus Akun
        </h2>
        <p className={`mb-4 ${isDark ? "text-red-300" : "text-red-600"}`}>
          Tindakan ini tidak dapat dibatalkan. Semua data yang terkait dengan
          akun ini akan dihapus secara permanen.
        </p>

        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Hapus Akun Saya
        </Button>
      </Card>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hapus Akun"
        size="md"
      >
        <form onSubmit={handleDeleteAccount}>
          <ModalBody>
            <div className="text-center py-2">
              <div
                className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                  isDark ? "bg-red-900/20" : "bg-red-100"
                } mb-4`}
              >
                <svg
                  className={`h-6 w-6 ${
                    isDark ? "text-red-400" : "text-red-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3
                className={`text-lg font-medium mb-2 ${
                  isDark ? "text-dark-primary" : "text-gray-900"
                }`}
              >
                Konfirmasi Penghapusan Akun
              </h3>
              <p
                className={`text-sm mb-4 ${
                  isDark ? "text-dark-secondary" : "text-gray-600"
                }`}
              >
                Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat
                dibatalkan.
              </p>
              <div
                className={`text-xs p-3 rounded-lg ${
                  isDark
                    ? "bg-dark-secondary/30 text-dark-muted"
                    : "bg-red-50 text-red-700"
                }`}
              >
                <p className="font-medium">Semua data akan dihapus permanen!</p>
                <p className="mt-1">
                  • Profil admin • Riwayat aktivitas • Data terkait lainnya
                </p>
              </div>
            </div>

            <Input
              label="Masukkan password Anda untuk konfirmasi"
              type="password"
              name="delete_password"
              required
              className="mt-4"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingAccount}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isDeletingAccount}
            >
              Ya, Hapus Akun
            </Button>
          </ModalFooter>
        </form>
      </Modal>

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

export default SecuritySettings;
