import React, { useState, useEffect, useCallback } from "react";
import {
  settingsService,
  UpdateProfileData,
} from "../../services/settingsService";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Toast from "../../components/ui/Toast";
import { formatDate } from "../../utils/formatters";

// Interface yang sesuai dengan response dari backend
interface Profile {
  id: number;
  nama_lengkap: string;
  username: string;
  email: string;
  is_super_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

const ProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Memindahkan loadProfile ke useCallback
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getProfile();
      setProfile(data);
    } catch (error: unknown) {
      console.error("Error loading profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memuat profil";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, []); // Tidak ada dependencies karena tidak menggunakan state/props

  useEffect(() => {
    loadProfile();
  }, [loadProfile]); // loadProfile sebagai dependency

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const updateData: UpdateProfileData = {
        nama_lengkap: formData.get("nama_lengkap") as string,
        username: formData.get("username") as string,
        email: formData.get("email") as string,
      };

      const updatedProfile = await settingsService.updateProfile(updateData);
      setProfile(updatedProfile);
      setToast({ message: "Profil berhasil diperbarui", type: "success" });
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memperbarui profil";
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

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p>Gagal memuat profil</p>
        <Button onClick={loadProfile} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Profil</h1>
        <p className="text-gray-600">Kelola informasi profil akun Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Lengkap"
                  name="nama_lengkap"
                  defaultValue={profile.nama_lengkap}
                  required
                />

                <Input
                  label="Username"
                  name="username"
                  defaultValue={profile.username}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  defaultValue={profile.email}
                  required
                />
              </div>

              <Button type="submit" isLoading={isSubmitting}>
                Simpan Perubahan
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Informasi Akun</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium">
                  {profile.is_super_admin ? "Super Admin" : "Admin"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bergabung:</span>
                <span className="font-medium">
                  {formatDate(profile.created_at.toString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Terakhir Diupdate:</span>
                <span className="font-medium">
                  {formatDate(profile.updated_at.toString())}
                </span>
              </div>
            </div>
          </div>
        </div>
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

export default ProfileSettings;
