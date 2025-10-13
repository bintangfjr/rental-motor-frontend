import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Penyewa,
  CreatePenyewaData,
  UpdatePenyewaData,
} from "../../types/penyewa";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import Textarea from "../Forms/FormTextarea";

const penyewaSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi").max(255, "Nama terlalu panjang"),
  alamat: z
    .string()
    .max(500, "Alamat terlalu panjang")
    .optional()
    .or(z.literal("")),
  no_whatsapp: z
    .string()
    .min(1, "Nomor WhatsApp wajib diisi")
    .max(15, "Nomor WhatsApp terlalu panjang")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,10}$/,
      "Format nomor WhatsApp tidak valid. Gunakan 08xx atau 628xx (10-13 digit)"
    ),
});

type PenyewaFormData = z.infer<typeof penyewaSchema>;

interface PenyewaFormProps {
  penyewa?: Penyewa;
  onSubmit: (data: CreatePenyewaData | UpdatePenyewaData) => void;
  isLoading?: boolean;
}

// Utility function untuk kompresi gambar
const compressImage = (
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 dengan quality yang ditentukan
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
};

// Utility function untuk validasi ukuran base64
const isBase64SizeValid = (base64: string, maxSizeKB = 500): boolean => {
  // Hitung ukuran approximate dalam KB
  const sizeKB = (base64.length * 0.75) / 1024;
  return sizeKB <= maxSizeKB;
};

export const PenyewaForm: React.FC<PenyewaFormProps> = ({
  penyewa,
  onSubmit,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PenyewaFormData>({
    resolver: zodResolver(penyewaSchema),
    defaultValues: penyewa
      ? {
          nama: penyewa.nama,
          alamat: penyewa.alamat || "",
          no_whatsapp: penyewa.no_whatsapp,
        }
      : undefined,
  });

  // Load existing image when editing
  useEffect(() => {
    if (penyewa?.foto_ktp) {
      setBase64Image(penyewa.foto_ktp);
      setPreviewUrl(penyewa.foto_ktp);
    }
  }, [penyewa]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    setImageError(null);

    if (!file) return;

    try {
      // Validasi ukuran file (max 5MB sebelum kompresi)
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Ukuran file maksimal 5MB");
        return;
      }

      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        setImageError("File harus berupa gambar (JPG, PNG)");
        return;
      }

      setSelectedFile(file);
      setIsCompressing(true);

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Compress image sebelum konversi ke base64
      console.log(
        "Original file size:",
        (file.size / 1024 / 1024).toFixed(2),
        "MB"
      );

      const compressedBase64 = await compressImage(file, 800, 0.7);

      console.log(
        "Compressed base64 size:",
        ((compressedBase64.length * 0.75) / 1024).toFixed(2),
        "KB"
      );

      // Validasi ukuran setelah kompresi
      if (!isBase64SizeValid(compressedBase64, 500)) {
        setImageError(
          "Gambar masih terlalu besar setelah kompresi. Silakan pilih gambar lain."
        );
        removeFile();
        return;
      }

      setBase64Image(compressedBase64);
    } catch (error) {
      console.error("Error processing file:", error);
      setImageError("Gagal memproses gambar. Silakan coba lagi.");
      removeFile();
    } finally {
      setIsCompressing(false);
    }
  };

  const removeFile = () => {
    // Cleanup preview URL jika menggunakan object URL
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setBase64Image(null);
    setImageError(null);
    setIsCompressing(false);

    // Reset file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmitHandler: SubmitHandler<PenyewaFormData> = async (data) => {
    // Validasi ukuran base64 sebelum submit
    if (base64Image && !isBase64SizeValid(base64Image, 500)) {
      setImageError(
        "Gambar terlalu besar. Silakan pilih gambar lain atau kompres ulang."
      );
      return;
    }

    const submitData: CreatePenyewaData | UpdatePenyewaData = {
      ...data,
      alamat: data.alamat || undefined,
      foto_ktp: base64Image || undefined,
    };

    console.log("Submitting data:", {
      ...submitData,
      foto_ktp: base64Image
        ? `base64_${((base64Image.length * 0.75) / 1024).toFixed(2)}KB`
        : "null",
    });

    onSubmit(submitData);
  };

  const hasImage = previewUrl || (penyewa?.foto_ktp && !imageError);

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            label="Nama Lengkap"
            {...register("nama")}
            error={errors.nama?.message}
            required
          />
          <Input
            label="Nomor WhatsApp"
            {...register("no_whatsapp")}
            error={errors.no_whatsapp?.message}
            placeholder="contoh: 081234567890 atau 6281234567890"
            required
          />
          <Controller
            name="alamat"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Alamat (Opsional)"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.alamat?.message}
                rows={4}
              />
            )}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto KTP (Opsional)
            </label>

            {imageError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {imageError}
              </div>
            )}

            {isCompressing && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-600">
                Mengkompresi gambar...
              </div>
            )}

            {hasImage ? (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={previewUrl || penyewa?.foto_ktp}
                    alt="Preview KTP"
                    className="w-full h-48 object-contain border border-gray-300 rounded-lg bg-gray-50"
                    onError={(e) => {
                      console.error("Error loading preview image:", e);
                      setImageError("Gagal memuat preview gambar");
                    }}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    disabled={isCompressing}
                  >
                    Hapus Foto
                  </Button>

                  {/* Upload ulang */}
                  <label className="flex-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      disabled={isCompressing}
                    >
                      Ganti Foto
                    </Button>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleFileChange}
                      disabled={isCompressing}
                    />
                  </label>
                </div>

                {/* Debug info */}
                {base64Image && (
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                    <p>
                      <strong>Size:</strong>{" "}
                      {((base64Image.length * 0.75) / 1024).toFixed(2)} KB
                      (setelah kompresi)
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {isBase64SizeValid(base64Image)
                        ? "✅ Ukuran OK"
                        : "❌ Terlalu besar"}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isCompressing ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-sm text-blue-600">Mengkompresi...</p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">
                            Klik untuk upload
                          </span>{" "}
                          atau drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, PNG (Max. 5MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileChange}
                    disabled={isCompressing}
                  />
                </label>
              </div>
            )}

            {/* File info */}
            {selectedFile && !imageError && !isCompressing && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <p>
                  <strong>File:</strong> {selectedFile.name}
                </p>
                <p>
                  <strong>Original Size:</strong>{" "}
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p>
                  <strong>Type:</strong> {selectedFile.type}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          isLoading={isLoading || isCompressing}
          disabled={!!imageError}
        >
          {penyewa ? "Update Penyewa" : "Tambah Penyewa"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading || isCompressing}
        >
          Batal
        </Button>
      </div>
    </form>
  );
};
