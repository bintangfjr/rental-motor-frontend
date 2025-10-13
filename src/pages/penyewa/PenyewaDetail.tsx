import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { penyewaService } from "../../services/penyewaService";
import { Penyewa } from "../../types/penyewa";
import { Button } from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";

// Utility function untuk menentukan apakah string adalah base64 data URL
const isBase64DataURL = (str: string | null): boolean => {
  if (!str) return false;
  return str.startsWith("data:image/");
};

// Utility function untuk menentukan apakah string adalah path file
const isFilePath = (str: string | null): boolean => {
  if (!str) return false;

  // Jika sudah data URL, bukan file path
  if (str.startsWith("data:")) return false;

  // Cek pattern file path
  return (
    (str.startsWith("fotos_penyewa/") ||
      str.startsWith("/fotos_penyewa/") ||
      str.includes(".png") ||
      str.includes(".jpg") ||
      str.includes(".jpeg")) &&
    !str.includes("base64")
  ); // Pastikan bukan base64
};

// Komponen untuk menampilkan gambar KTP dengan fallback
const KTPImageWithFallback: React.FC<{
  src: string | null;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [safeSrc, setSafeSrc] = useState<string | null>(null);

  // Format dan validasi source image
  useEffect(() => {
    console.log("KTP Image Processing Started:", {
      hasSrc: !!src,
      srcType: src
        ? isBase64DataURL(src)
          ? "BASE64_DATA_URL"
          : isFilePath(src)
          ? "FILE_PATH"
          : "UNKNOWN"
        : "NO_SRC",
      srcLength: src?.length,
    });

    if (!src) {
      console.log("No KTP image provided");
      setImgError(true);
      setIsLoading(false);
      setSafeSrc(null);
      return;
    }

    let formattedSrc = src;

    // Jika ini sudah base64 data URL, gunakan langsung
    if (isBase64DataURL(src)) {
      console.log("Using base64 data URL directly");
      formattedSrc = src;
    }
    // Jika ini path file, kita perlu membangun URL yang benar
    else if (isFilePath(src)) {
      console.log("Processing as file path");
      // Tambahkan slash untuk relative path dari public folder
      formattedSrc = src.startsWith("/") ? src : `/${src}`;
    }
    // Jika tidak dikenal, anggap sebagai base64 tanpa prefix (legacy)
    else if (src.length > 1000) {
      console.log("Treating as legacy base64 without prefix");
      formattedSrc = `data:image/jpeg;base64,${src}`;
    }
    // Jika tidak ada kondisi yang cocok, error
    else {
      console.error("Unknown image format:", src.substring(0, 100));
      setImgError(true);
      setIsLoading(false);
      setSafeSrc(null);
      return;
    }

    console.log("Setting safe source, length:", formattedSrc.length);
    setSafeSrc(formattedSrc);
    setIsLoading(true);
    setImgError(false);

    // Preload image untuk deteksi error
    const img = new Image();
    img.onload = () => {
      console.log("Image preloaded successfully");
      setIsLoading(false);
      setImgError(false);
    };
    img.onerror = () => {
      console.error("Image failed to preload");
      setImgError(true);
      setIsLoading(false);
    };
    img.src = formattedSrc;
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Error loading KTP image in img tag:", {
      safeSrcLength: safeSrc?.length,
      error: e,
    });
    setImgError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log("KTP image loaded successfully in img tag");
    setIsLoading(false);
    setImgError(false);
  };

  // Jika tidak ada source atau error, tampilkan fallback
  if (!src || imgError) {
    return (
      <div className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">
            {!src ? "Tidak ada foto KTP" : "Gagal memuat foto KTP"}
          </p>
          {/* Ganti dengan import.meta.env.MODE untuk Vite */}
          {import.meta.env.MODE === "development" && src && (
            <p className="mt-1 text-xs text-gray-400">
              Size: {((src.length * 0.75) / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>
    );
  }

  // Jika masih loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-64 border border-gray-300 rounded-lg bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-sm text-gray-500">Memuat gambar...</p>
        {/* Ganti dengan import.meta.env.MODE untuk Vite */}
        {import.meta.env.MODE === "development" && (
          <p className="text-xs text-gray-400 mt-1">
            {((src.length * 0.75) / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>
    );
  }

  // Render gambar jika ada safeSrc dan tidak error
  return (
    <div className="relative">
      {safeSrc && (
        <img
          src={safeSrc}
          alt={alt}
          className={className}
          onError={handleError}
          onLoad={handleLoad}
        />
      )}

      {/* Debug info - hanya di development */}
      {import.meta.env.MODE === "development" && safeSrc && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
          <p>
            <strong>Status:</strong> {isLoading ? "Loading" : "Loaded"}
          </p>
          <p>
            <strong>Type:</strong>{" "}
            {isBase64DataURL(src) ? "Base64 Data URL" : "File Path"}
          </p>
          <p>
            <strong>Size:</strong>{" "}
            {((src.length * 0.75) / 1024 / 1024).toFixed(2)} MB
          </p>
          <p>
            <strong>Dimensions:</strong> Checking...
          </p>
        </div>
      )}
    </div>
  );
};

export const PenyewaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [penyewa, setPenyewa] = useState<Penyewa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadPenyewa = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const penyewaData = await penyewaService.getById(Number(id));

      console.log("Loaded penyewa data:", {
        id,
        hasFotoKtp: !!penyewaData.foto_ktp,
        fotoKtpType: penyewaData.foto_ktp?.startsWith("data:image/")
          ? "BASE64_DATA_URL"
          : "OTHER",
        fotoKtpSize: penyewaData.foto_ktp
          ? `${((penyewaData.foto_ktp.length * 0.75) / 1024 / 1024).toFixed(
              2
            )} MB`
          : "N/A",
      });

      setPenyewa(penyewaData);
    } catch (error) {
      console.error("Error loading penyewa:", error);
      setToast({
        message: "Gagal memuat data penyewa",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPenyewa();
  }, [loadPenyewa]);

  const handleToggleBlacklist = async () => {
    if (!penyewa) return;

    try {
      const updatedPenyewa = await penyewaService.toggleBlacklist(penyewa.id);
      setPenyewa(updatedPenyewa);
      setToast({
        message: `Penyewa ${
          updatedPenyewa.is_blacklisted ? "ditambahkan ke" : "dihapus dari"
        } blacklist`,
        type: "success",
      });
    } catch (error) {
      console.error("Error toggling blacklist:", error);
      setToast({
        message: "Gagal mengubah status blacklist",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!penyewa) return;

    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus penyewa ${penyewa.nama}? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      try {
        await penyewaService.delete(penyewa.id);
        setToast({
          message: "Penyewa berhasil dihapus",
          type: "success",
        });
        setTimeout(() => navigate("/penyewas"), 1000);
      } catch (error) {
        console.error("Error deleting penyewa:", error);
        setToast({
          message: "Gagal menghapus penyewa",
          type: "error",
        });
      }
    }
  };

  const handleEdit = () => {
    navigate(`/penyewas/edit/${penyewa?.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Memuat data penyewa...</div>
      </div>
    );
  }

  if (!penyewa) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">
            Penyewa tidak ditemukan
          </div>
          <Button variant="outline" onClick={() => navigate("/penyewas")}>
            Kembali ke Daftar Penyewa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/penyewas")}>
            ← Kembali ke Daftar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Detail Penyewa</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button
            variant={penyewa.is_blacklisted ? "success" : "secondary"}
            onClick={handleToggleBlacklist}
          >
            {penyewa.is_blacklisted
              ? "Hapus dari Blacklist"
              : "Tambah ke Blacklist"}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Informasi Penyewa
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Informasi Utama */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {penyewa.nama}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <p className="text-lg text-gray-900">{penyewa.no_whatsapp}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      penyewa.is_blacklisted
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {penyewa.is_blacklisted ? "Blacklisted" : "Aktif"}
                  </span>
                </div>

                {penyewa.alamat && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {penyewa.alamat}
                    </p>
                  </div>
                )}
              </div>

              {/* Informasi Tambahan */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  Informasi Tambahan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-600 mb-1">
                      Tanggal Dibuat
                    </label>
                    <p className="text-gray-900">
                      {new Date(penyewa.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">
                      Terakhir Diupdate
                    </label>
                    <p className="text-gray-900">
                      {new Date(penyewa.updated_at).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto KTP */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Foto KTP
                </label>
                <KTPImageWithFallback
                  src={penyewa.foto_ktp || null} // Konversi undefined ke null
                  alt="Foto KTP"
                  className="w-full h-64 object-contain border border-gray-300 rounded-lg bg-gray-50"
                />
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
          duration={3000}
        />
      )}
    </div>
  );
};

export default PenyewaDetail;
