import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateAdminData, UpdateAdminData } from "../../types/admin";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";
import { useTheme } from "../../hooks/useTheme";

// -------------------
// SCHEMA VALIDASI
// -------------------

// Base schema untuk field-field umum
const baseAdminSchema = {
  nama_lengkap: z
    .string()
    .min(1, "Nama lengkap wajib diisi")
    .max(255, "Terlalu panjang"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(255, "Terlalu panjang"),
  email: z.string().email("Email tidak valid").max(255, "Terlalu panjang"),
  is_super_admin: z.boolean().default(false),
};

// Schema untuk CREATE
const createAdminSchema = z
  .object({
    ...baseAdminSchema,
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar, huruf kecil, dan angka"
      ),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak sesuai",
    path: ["password_confirmation"],
  });

// Schema untuk UPDATE dengan password opsional
const updateAdminSchema = z
  .object({
    ...baseAdminSchema,
    password: z
      .union([
        z.string().length(0), // empty string
        z
          .string()
          .min(8, "Password minimal 8 karakter")
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password harus mengandung huruf besar, huruf kecil, dan angka"
          ),
      ])
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    password_confirmation: z.string().optional(),
  })
  .refine(
    (data) => !data.password || data.password === data.password_confirmation,
    {
      message: "Konfirmasi password tidak sesuai",
      path: ["password_confirmation"],
    }
  );

// Type untuk form data
type CreateFormData = z.infer<typeof createAdminSchema>;
type UpdateFormData = z.infer<typeof updateAdminSchema>;
type FormData = CreateFormData | UpdateFormData;

interface AdminFormProps {
  onSubmit: (data: CreateAdminData | UpdateAdminData) => void | Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<FormData>;
  isEdit?: boolean;
}

export function AdminForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  isEdit = false,
}: AdminFormProps) {
  const { isDark } = useTheme();
  const schema = isEdit ? updateAdminSchema : createAdminSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_super_admin: false,
      password: "",
      password_confirmation: "",
      ...defaultValues,
    } as FormData,
  });

  // Watch password field untuk conditional rendering
  const passwordValue = watch("password");
  const isSuperAdmin = watch("is_super_admin");

  const handleFormSubmit = (data: FormData) => {
    if (isEdit) {
      // Untuk UPDATE
      const updateData: UpdateAdminData = {
        nama_lengkap: data.nama_lengkap,
        username: data.username,
        email: data.email,
        is_super_admin: Boolean(data.is_super_admin),
      };

      // Hanya sertakan password jika diisi
      if (data.password && data.password.trim() !== "") {
        updateData.password = data.password;
      }

      console.log("Update payload:", updateData);
      onSubmit(updateData);
    } else {
      // Untuk CREATE
      const createData: CreateAdminData = {
        nama_lengkap: data.nama_lengkap,
        username: data.username,
        email: data.email,
        password: data.password!,
        password_confirmation: data.password_confirmation!,
        is_super_admin: Boolean(data.is_super_admin),
      };

      console.log("Create payload:", createData);
      onSubmit(createData);
    }
  };

  const handleSuperAdminChange = (checked: boolean) => {
    setValue("is_super_admin", checked);
  };

  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === "development";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Lengkap */}
        <Input
          label="Nama Lengkap *"
          {...register("nama_lengkap")}
          error={errors.nama_lengkap?.message}
          disabled={isLoading}
          placeholder="Masukkan nama lengkap admin"
        />

        {/* Username */}
        <Input
          label="Username *"
          {...register("username")}
          error={errors.username?.message}
          disabled={isLoading}
          placeholder="Minimal 3 karakter"
        />

        {/* Email */}
        <Input
          label="Email *"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          disabled={isLoading}
          placeholder="email@contoh.com"
        />

        {/* Password */}
        <Input
          label={isEdit ? "Password Baru" : "Password *"}
          type="password"
          {...register("password")}
          error={errors.password?.message}
          disabled={isLoading}
          placeholder={
            isEdit
              ? "Kosongkan jika tidak ingin mengubah password"
              : "Min. 8 karakter dengan huruf besar, kecil, dan angka"
          }
        />

        {/* Password Confirmation - Conditional */}
        {(!isEdit || passwordValue) && (
          <Input
            label={
              isEdit ? "Konfirmasi Password Baru" : "Konfirmasi Password *"
            }
            type="password"
            {...register("password_confirmation")}
            error={errors.password_confirmation?.message}
            disabled={isLoading}
            placeholder="Ulangi password di atas"
          />
        )}

        {/* Super Admin Switch */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
          <div className="flex-1">
            <label
              className={`text-sm font-medium ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Super Admin
            </label>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              {isSuperAdmin
                ? "Akses penuh ke semua fitur sistem"
                : "Akses terbatas sesuai role"}
            </p>
          </div>
          <Switch
            checked={isSuperAdmin}
            onCheckedChange={handleSuperAdminChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Informasi Password */}
      <div
        className={`p-4 rounded-lg border ${
          isDark
            ? "bg-blue-900/20 border-blue-800 text-blue-300"
            : "bg-blue-50 border-blue-200 text-blue-700"
        }`}
      >
        <p className="text-sm font-medium mb-1">Persyaratan Password:</p>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Minimal 8 karakter</li>
          <li>Mengandung huruf besar (A-Z)</li>
          <li>Mengandung huruf kecil (a-z)</li>
          <li>Mengandung angka (0-9)</li>
        </ul>
      </div>

      {/* Informasi Super Admin */}
      {isSuperAdmin && (
        <div
          className={`p-4 rounded-lg border ${
            isDark
              ? "bg-yellow-900/20 border-yellow-800 text-yellow-300"
              : "bg-yellow-50 border-yellow-200 text-yellow-700"
          }`}
        >
          <p className="text-sm font-medium mb-1">Super Admin Akses:</p>
          <ul className="text-sm list-disc list-inside space-y-1">
            <li>Akses penuh ke semua modul sistem</li>
            <li>Dapat mengelola admin lain</li>
            <li>Akses ke pengaturan sistem</li>
            <li>Dapat melihat semua data dan laporan</li>
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-dark-border">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
          className="min-w-[120px]"
          size="lg"
        >
          {isLoading
            ? "Menyimpan..."
            : isEdit
            ? "Update Admin"
            : "Simpan Admin"}
        </Button>
      </div>

      {/* Debug Info - Hanya di development */}
      {isDevelopment && (
        <div
          className={`p-3 rounded-lg text-xs ${
            isDark
              ? "bg-dark-secondary/30 text-dark-muted"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <p>
            <strong>Debug Info:</strong>
          </p>
          <p>Mode: {isEdit ? "Edit" : "Create"}</p>
          <p>Super Admin: {isSuperAdmin ? "Ya" : "Tidak"}</p>
          <p>Password Length: {passwordValue?.length || 0}</p>
        </div>
      )}
    </form>
  );
}
