// src/components/admin/AdminForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateAdminData, UpdateAdminData } from "../../types/admin";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

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
type FormData =
  | z.infer<typeof createAdminSchema>
  | z.infer<typeof updateAdminSchema>;

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
  const schema = isEdit ? updateAdminSchema : createAdminSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      is_super_admin: false,
      password: "",
      password_confirmation: "",
      ...defaultValues,
    },
  });

  // Watch password field untuk conditional rendering
  const passwordValue = watch("password");

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
        password: data.password,
        password_confirmation: data.password_confirmation,
        is_super_admin: Boolean(data.is_super_admin),
      };

      console.log("Create payload:", createData);
      onSubmit(createData);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Lengkap */}
        <Input
          label="Nama Lengkap *"
          {...register("nama_lengkap")}
          error={errors.nama_lengkap?.message}
          disabled={isLoading}
        />

        {/* Username */}
        <Input
          label="Username *"
          {...register("username")}
          error={errors.username?.message}
          disabled={isLoading}
        />

        {/* Email */}
        <Input
          label="Email *"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          disabled={isLoading}
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

        {/* Super Admin Checkbox */}
        <div className="flex items-center space-x-3 p-2">
          <input
            type="checkbox"
            id="is_super_admin"
            {...register("is_super_admin")}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isLoading}
          />
          <label
            htmlFor="is_super_admin"
            className="text-sm font-medium text-gray-700"
          >
            Super Admin
          </label>
          {errors.is_super_admin && (
            <p className="text-red-500 text-sm">
              {errors.is_super_admin.message}
            </p>
          )}
        </div>
      </div>

      {/* Informasi Password */}
      {!isEdit && (
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Password harus mengandung:</strong> minimal 8 karakter,
            huruf besar, huruf kecil, dan angka
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading
            ? "Menyimpan..."
            : isEdit
            ? "Update Admin"
            : "Simpan Admin"}
        </Button>
      </div>
    </form>
  );
}
