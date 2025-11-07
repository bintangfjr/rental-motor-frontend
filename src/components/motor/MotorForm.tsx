import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Motor, GpsStatus } from "../../types/motor";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { useTheme } from "@/hooks/useTheme"; // Tambahkan useTheme hook

const CURRENT_YEAR = new Date().getFullYear();

const motorSchema = z.object({
  plat_nomor: z
    .string()
    .min(1, "Plat nomor wajib diisi")
    .max(20, "Plat nomor maksimal 20 karakter")
    .regex(
      /^[A-Z0-9\s]+$/,
      "Plat nomor hanya boleh mengandung huruf kapital, angka, dan spasi"
    ),
  merk: z
    .string()
    .min(1, "Merk wajib diisi")
    .max(255, "Merk maksimal 255 karakter"),
  model: z
    .string()
    .min(1, "Model wajib diisi")
    .max(255, "Model maksimal 255 karakter"),
  tahun: z
    .number()
    .min(1990, `Tahun minimal 1990`)
    .max(CURRENT_YEAR + 1, `Tahun maksimal ${CURRENT_YEAR + 1}`),
  harga: z
    .number()
    .min(0, "Harga tidak boleh negatif")
    .max(100000000, "Harga terlalu besar"),
  imei: z
    .string()
    .max(20, "IMEI maksimal 20 karakter")
    .regex(/^[0-9]*$/, "IMEI hanya boleh mengandung angka")
    .optional()
    .or(z.literal("")),
  status: z.enum(["tersedia", "disewa", "perbaikan", "pending_perbaikan"]),
  service_technician: z
    .string()
    .max(255, "Nama teknisi maksimal 255 karakter")
    .optional()
    .or(z.literal("")),
  service_notes: z
    .string()
    .max(255, "Catatan service maksimal 255 karakter")
    .optional()
    .or(z.literal("")),
});

type MotorFormData = z.infer<typeof motorSchema>;

// Define local types untuk Create dan Update data
type CreateMotorData = Omit<MotorFormData, "id"> & {
  last_service_date?: string;
};

type UpdateMotorData = MotorFormData & {
  last_service_date?: string;
  total_mileage?: number;
  lat?: number;
  lng?: number;
};

interface MotorFormProps {
  motor?: Motor;
  onSubmit: (data: CreateMotorData | UpdateMotorData) => void;
  isLoading?: boolean;
  onImeiCheck?: (imei: string) => Promise<boolean> | void;
  imeiValidation?: {
    isValidating: boolean;
    isValid: boolean;
    message?: string;
  };
  isSubmitting?: boolean;
  showServiceFields?: boolean;
}

export const MotorForm: React.FC<MotorFormProps> = ({
  motor,
  onSubmit,
  isLoading = false,
  isSubmitting = false,
  onImeiCheck,
  imeiValidation,
  showServiceFields = false,
}) => {
  const { isDark } = useTheme(); // Gunakan useTheme hook

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    trigger,
    setError,
    clearErrors,
    reset,
  } = useForm<MotorFormData>({
    resolver: zodResolver(motorSchema),
    mode: "onChange",
    defaultValues: motor
      ? {
          plat_nomor: motor.plat_nomor,
          merk: motor.merk,
          model: motor.model,
          tahun: motor.tahun,
          harga: motor.harga,
          imei: motor.imei || "",
          status: motor.status,
          service_technician: motor.service_technician || "",
          service_notes: motor.service_notes || "",
        }
      : {
          status: "tersedia",
          tahun: CURRENT_YEAR,
          harga: 0,
          imei: "",
          service_technician: "",
          service_notes: "",
        },
  });

  // Watch fields for real-time validation
  const imeiValue = watch("imei");
  const platNomorValue = watch("plat_nomor");
  const statusValue = watch("status");

  // Reset form ketika motor berubah
  useEffect(() => {
    if (motor) {
      reset({
        plat_nomor: motor.plat_nomor,
        merk: motor.merk,
        model: motor.model,
        tahun: motor.tahun,
        harga: motor.harga,
        imei: motor.imei || "",
        status: motor.status,
        service_technician: motor.service_technician || "",
        service_notes: motor.service_notes || "",
      });
    }
  }, [motor, reset]);

  // Auto-format plat nomor to uppercase
  useEffect(() => {
    if (platNomorValue) {
      const formatted = platNomorValue.toUpperCase();
      if (formatted !== platNomorValue) {
        setValue("plat_nomor", formatted, { shouldValidate: true });
      }
    }
  }, [platNomorValue, setValue]);

  // IMEI validation with debounce
  useEffect(() => {
    if (onImeiCheck && imeiValue && imeiValue.length >= 10) {
      // Clear previous errors
      clearErrors("imei");

      // Debounce IMEI check
      const timer = setTimeout(async () => {
        try {
          await onImeiCheck(imeiValue);
        } catch {
          // Error handling sudah dilakukan di parent component
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [imeiValue, onImeiCheck, setError, clearErrors]);

  const handleFormSubmit = async (data: MotorFormData) => {
    // Format data sesuai dengan backend
    const submitData = {
      plat_nomor: data.plat_nomor.trim(),
      merk: data.merk.trim(),
      model: data.model.trim(),
      tahun: data.tahun,
      harga: data.harga,
      imei: data.imei?.trim() || undefined,
      status: data.status,
      ...(showServiceFields && {
        service_technician: data.service_technician?.trim() || undefined,
        service_notes: data.service_notes?.trim() || undefined,
      }),
    };

    onSubmit(submitData);
  };

  const getImeiFieldMessage = () => {
    if (!imeiValue || imeiValue.length === 0) {
      return null;
    }

    if (imeiValidation?.isValidating) {
      return "Memvalidasi IMEI...";
    }

    if (errors.imei) {
      return errors.imei.message;
    }

    if (imeiValidation?.isValid === true) {
      return imeiValidation.message || "IMEI valid";
    }

    if (imeiValidation?.isValid === false) {
      return imeiValidation.message || "IMEI tidak valid";
    }

    // IMEI length validation
    if (imeiValue.length > 0 && imeiValue.length < 10) {
      return "IMEI harus minimal 10 digit";
    }

    return null;
  };

  // Color classes untuk dark theme
  const getStatusColor = (status: string) => {
    const baseClasses = "px-3 py-2 rounded border text-sm font-medium";

    switch (status) {
      case "tersedia":
        return isDark
          ? `${baseClasses} text-green-300 bg-green-900/20 border-green-800`
          : `${baseClasses} text-green-600 bg-green-50 border-green-200`;
      case "disewa":
        return isDark
          ? `${baseClasses} text-blue-300 bg-blue-900/20 border-blue-800`
          : `${baseClasses} text-blue-600 bg-blue-50 border-blue-200`;
      case "perbaikan":
        return isDark
          ? `${baseClasses} text-orange-300 bg-orange-900/20 border-orange-800`
          : `${baseClasses} text-orange-600 bg-orange-50 border-orange-200`;
      case "pending_perbaikan":
        return isDark
          ? `${baseClasses} text-yellow-300 bg-yellow-900/20 border-yellow-800`
          : `${baseClasses} text-yellow-600 bg-yellow-50 border-yellow-200`;
      default:
        return isDark
          ? `${baseClasses} text-gray-300 bg-gray-900/20 border-gray-800`
          : `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`;
    }
  };

  const getGpsStatusColor = (status: string) => {
    const baseClasses = "px-3 py-2 rounded border text-sm font-medium";

    switch (status) {
      case GpsStatus.ONLINE:
        return isDark
          ? `${baseClasses} text-green-300 bg-green-900/20 border-green-800`
          : `${baseClasses} text-green-600 bg-green-50 border-green-200`;
      case GpsStatus.OFFLINE:
        return isDark
          ? `${baseClasses} text-red-300 bg-red-900/20 border-red-800`
          : `${baseClasses} text-red-600 bg-red-50 border-red-200`;
      case GpsStatus.NO_IMEI:
        return isDark
          ? `${baseClasses} text-gray-300 bg-gray-900/20 border-gray-800`
          : `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`;
      case GpsStatus.ERROR:
        return isDark
          ? `${baseClasses} text-orange-300 bg-orange-900/20 border-orange-800`
          : `${baseClasses} text-orange-600 bg-orange-50 border-orange-200`;
      default:
        return isDark
          ? `${baseClasses} text-gray-300 bg-gray-900/20 border-gray-800`
          : `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`;
    }
  };

  const getInfoBoxColor = () => {
    return isDark
      ? "bg-blue-900/20 border-blue-800"
      : "bg-blue-50 border-blue-200";
  };

  const getCardClass = () => {
    return isDark
      ? "rm-card bg-dark-card border-dark-border"
      : "bg-white border-gray-200";
  };

  const getTextColor = () => {
    return isDark ? "text-dark-primary" : "text-gray-900";
  };

  const getMutedTextColor = () => {
    return isDark ? "text-dark-muted" : "text-gray-500";
  };

  const imeiMessage = getImeiFieldMessage();
  const isSubmitDisabled =
    isLoading || isSubmitting || !isValid || (!isDirty && !!motor);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Informasi Dasar */}
        <div className="space-y-6">
          <div className={`rounded-lg border p-6 ${getCardClass()}`}>
            <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>
              Informasi Dasar
            </h3>

            <div className="space-y-4">
              <Input
                label="Plat Nomor"
                {...register("plat_nomor")}
                error={errors.plat_nomor?.message}
                required
                placeholder="Contoh: B 1234 ABC"
                disabled={isSubmitting}
                onBlur={() => trigger("plat_nomor")}
              />

              <Input
                label="Merk"
                {...register("merk")}
                error={errors.merk?.message}
                required
                placeholder="Contoh: Honda, Yamaha"
                disabled={isSubmitting}
                onBlur={() => trigger("merk")}
              />

              <Input
                label="Model"
                {...register("model")}
                error={errors.model?.message}
                required
                placeholder="Contoh: Beat, NMAX"
                disabled={isSubmitting}
                onBlur={() => trigger("model")}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tahun"
                  type="number"
                  {...register("tahun", {
                    valueAsNumber: true,
                    onChange: () => trigger("tahun"),
                  })}
                  error={errors.tahun?.message}
                  required
                  min={1990}
                  max={CURRENT_YEAR + 1}
                  disabled={isSubmitting}
                />

                <Input
                  label="Harga Sewa per Hari (Rp)"
                  type="number"
                  {...register("harga", {
                    valueAsNumber: true,
                    onChange: () => trigger("harga"),
                  })}
                  error={errors.harga?.message}
                  required
                  min={0}
                  step={1000}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Informasi Teknis */}
          <div className={`rounded-lg border p-6 ${getCardClass()}`}>
            <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>
              Informasi Teknis
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  label="IMEI GPS (Opsional)"
                  {...register("imei")}
                  error={errors.imei?.message || imeiMessage || undefined}
                  placeholder="15 digit IMEI device GPS"
                  disabled={isSubmitting}
                  onBlur={() => trigger("imei")}
                />
                {!imeiValue && (
                  <p className={`text-xs ${getMutedTextColor()}`}>
                    IMEI diperlukan untuk fitur GPS tracking real-time
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status & Service Information */}
        <div className="space-y-6">
          <div className={`rounded-lg border p-6 ${getCardClass()}`}>
            <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>
              Status Motor
            </h3>

            <div className="space-y-4">
              <Select
                label="Status"
                {...register("status")}
                error={errors.status?.message}
                options={[
                  { value: "tersedia", label: "Tersedia" },
                  { value: "disewa", label: "Disewa" },
                  { value: "perbaikan", label: "Dalam Perbaikan" },
                  { value: "pending_perbaikan", label: "Menunggu Perbaikan" },
                ]}
                required
                disabled={isSubmitting}
              />

              {motor && (
                <div className="space-y-3">
                  <div className={getStatusColor(statusValue)}>
                    <p className="text-sm font-medium">
                      Status Saat Ini: {statusValue}
                    </p>
                  </div>

                  <div className={getGpsStatusColor(motor.gps_status)}>
                    <p className="text-sm font-medium">
                      Status GPS: {motor.gps_status}
                      {motor.last_update && (
                        <span className="ml-2 font-normal">
                          • Terakhir update:{" "}
                          {new Date(motor.last_update).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      )}
                    </p>
                  </div>

                  {motor.total_mileage && motor.total_mileage > 0 && (
                    <div
                      className={
                        isDark
                          ? "px-3 py-2 rounded border border-blue-800 bg-blue-900/20"
                          : "px-3 py-2 rounded border border-blue-200 bg-blue-50"
                      }
                    >
                      <p
                        className={
                          isDark
                            ? "text-sm text-blue-300"
                            : "text-sm text-blue-700"
                        }
                      >
                        <strong>Total Mileage:</strong>{" "}
                        {motor.total_mileage.toLocaleString()} km
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Service Information - Hanya ditampilkan jika showServiceFields true */}
          {showServiceFields && (
            <div className={`rounded-lg border p-6 ${getCardClass()}`}>
              <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>
                Informasi Service
              </h3>

              <div className="space-y-4">
                <Input
                  label="Teknisi Service (Opsional)"
                  {...register("service_technician")}
                  error={errors.service_technician?.message}
                  placeholder="Nama teknisi yang menangani"
                  disabled={isSubmitting}
                  onBlur={() => trigger("service_technician")}
                />

                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium ${getTextColor()}`}
                  >
                    Catatan Service (Opsional)
                  </label>
                  <textarea
                    {...register("service_notes")}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? "bg-dark-secondary border-dark-border text-dark-primary"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="Catatan service, kerusakan, atau informasi penting lainnya..."
                    disabled={isSubmitting}
                  />
                  {errors.service_notes && (
                    <p className="text-sm text-red-600">
                      {errors.service_notes.message}
                    </p>
                  )}
                </div>

                {motor?.last_service_date && (
                  <div
                    className={
                      isDark
                        ? "px-3 py-2 rounded border border-gray-700 bg-gray-900/20"
                        : "px-3 py-2 rounded border border-gray-200 bg-gray-50"
                    }
                  >
                    <p
                      className={
                        isDark
                          ? "text-sm text-gray-300"
                          : "text-sm text-gray-700"
                      }
                    >
                      <strong>Terakhir Service:</strong>{" "}
                      {new Date(motor.last_service_date).toLocaleDateString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Informasi IMEI */}
      <div className={`rounded-lg p-4 ${getInfoBoxColor()}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className={`w-4 h-4 ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p
              className={`text-sm ${
                isDark ? "text-blue-300" : "text-blue-700"
              }`}
            >
              <strong>Informasi IMEI</strong> - Motor tanpa IMEI tetap bisa
              ditambahkan. IMEI diperlukan untuk fitur GPS tracking, monitoring
              real-time, dan sinkronisasi otomatis dengan sistem IOPGPS.
              Pastikan IMEI sudah terdaftar di sistem IOPGPS.
            </p>
          </div>
        </div>
      </div>

      <div
        className={`flex justify-end pt-6 border-t ${
          isDark ? "border-dark-border" : "border-gray-200"
        }`}
      >
        <Button
          type="submit"
          isLoading={isLoading || isSubmitting}
          disabled={isSubmitDisabled}
          size="lg"
          className="min-w-[140px]"
        >
          {motor ? "Update Motor" : "Tambah Motor"}
        </Button>
      </div>
    </form>
  );
};
