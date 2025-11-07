import React, { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";

// Utility functions
const isBase64DataURL = (str: string | null): boolean => {
  if (!str) return false;
  return str.startsWith("data:image/");
};

const isFilePath = (str: string | null): boolean => {
  if (!str) return false;
  if (str.startsWith("data:")) return false;
  return (
    (str.startsWith("fotos_penyewa/") ||
      str.startsWith("/fotos_penyewa/") ||
      str.includes(".png") ||
      str.includes(".jpg") ||
      str.includes(".jpeg")) &&
    !str.includes("base64")
  );
};

interface KTPImageWithFallbackProps {
  src: string | null;
  alt: string;
  className?: string;
}

export const KTPImageWithFallback: React.FC<KTPImageWithFallbackProps> = ({
  src,
  alt,
  className,
}) => {
  const { isDark } = useTheme();
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [safeSrc, setSafeSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setImgError(true);
      setIsLoading(false);
      setSafeSrc(null);
      return;
    }

    let formattedSrc = src;

    if (isBase64DataURL(src)) {
      formattedSrc = src;
    } else if (isFilePath(src)) {
      formattedSrc = src.startsWith("/") ? src : `/${src}`;
    } else if (src.length > 1000) {
      formattedSrc = `data:image/jpeg;base64,${src}`;
    } else {
      setImgError(true);
      setIsLoading(false);
      setSafeSrc(null);
      return;
    }

    setSafeSrc(formattedSrc);
    setIsLoading(true);
    setImgError(false);

    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
      setImgError(false);
    };
    img.onerror = () => {
      setImgError(true);
      setIsLoading(false);
    };
    img.src = formattedSrc;
  }, [src]);

  const handleError = () => {
    setImgError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setImgError(false);
  };

  if (!src || imgError) {
    return (
      <div
        className={`flex items-center justify-center w-full h-64 border-2 border-dashed rounded-lg ${
          isDark
            ? "border-dark-border bg-dark-secondary/50"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <div className="text-center">
          <svg
            className={`w-12 h-12 mx-auto ${
              isDark ? "text-dark-muted" : "text-gray-400"
            }`}
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
          <p
            className={`mt-2 text-sm ${
              isDark ? "text-dark-muted" : "text-gray-500"
            }`}
          >
            {!src ? "Tidak ada foto KTP" : "Gagal memuat foto KTP"}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`flex flex-col items-center justify-center w-full h-64 border rounded-lg ${
          isDark
            ? "border-dark-border bg-dark-secondary/50"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <div
          className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            isDark ? "border-blue-400" : "border-blue-600"
          } mb-2`}
        ></div>
        <p
          className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-500"}`}
        >
          Memuat gambar...
        </p>
      </div>
    );
  }

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
    </div>
  );
};
