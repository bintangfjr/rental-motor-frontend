import React from "react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { useTheme } from "../../hooks/useTheme";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
  size = "md",
}) => {
  const { isDark } = useTheme();

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: "h-8 w-8",
      title: "text-sm font-medium",
      description: "text-xs",
      padding: "py-8",
    },
    md: {
      icon: "h-12 w-12",
      title: "text-lg font-medium",
      description: "text-sm",
      padding: "py-12",
    },
    lg: {
      icon: "h-16 w-16",
      title: "text-xl font-semibold",
      description: "text-base",
      padding: "py-16",
    },
  };

  const currentSize = sizeConfig[size];

  const defaultIcon = (
    <svg
      className={cn("mx-auto text-gray-400", currentSize.icon)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <div className={cn("text-center", currentSize.padding, className)}>
      <div
        className={cn(
          "mx-auto mb-4",
          isDark ? "text-dark-muted" : "text-gray-400"
        )}
      >
        {icon || defaultIcon}
      </div>

      <h3
        className={cn(
          currentSize.title,
          "mb-2",
          isDark ? "text-dark-primary" : "text-gray-900"
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            currentSize.description,
            "max-w-md mx-auto",
            isDark ? "text-dark-secondary" : "text-gray-500"
          )}
        >
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          <Button
            onClick={action.onClick}
            variant="primary"
            size={size === "sm" ? "sm" : "md"}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

// Specific empty states untuk modul yang berbeda dengan dark theme support
export const MotorEmptyState: React.FC<{
  onAddMotor?: () => void;
  size?: "sm" | "md" | "lg";
}> = ({ onAddMotor, size = "md" }) => {
  return (
    <EmptyState
      title="Tidak ada motor"
      description="Mulai dengan menambahkan motor pertama ke sistem."
      icon={
        <svg
          className={cn(
            "mx-auto",
            size === "sm"
              ? "h-8 w-8"
              : size === "md"
              ? "h-12 w-12"
              : "h-16 w-16"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      }
      action={
        onAddMotor
          ? {
              label: "Tambah Motor",
              onClick: onAddMotor,
            }
          : undefined
      }
      size={size}
    />
  );
};

export const PenyewaEmptyState: React.FC<{
  onAddPenyewa?: () => void;
  size?: "sm" | "md" | "lg";
}> = ({ onAddPenyewa, size = "md" }) => {
  return (
    <EmptyState
      title="Tidak ada penyewa"
      description="Mulai dengan menambahkan penyewa pertama ke sistem."
      icon={
        <svg
          className={cn(
            "mx-auto",
            size === "sm"
              ? "h-8 w-8"
              : size === "md"
              ? "h-12 w-12"
              : "h-16 w-16"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      }
      action={
        onAddPenyewa
          ? {
              label: "Tambah Penyewa",
              onClick: onAddPenyewa,
            }
          : undefined
      }
      size={size}
    />
  );
};

export const SewaEmptyState: React.FC<{
  onAddSewa?: () => void;
  size?: "sm" | "md" | "lg";
}> = ({ onAddSewa, size = "md" }) => {
  return (
    <EmptyState
      title="Tidak ada sewa aktif"
      description="Buat transaksi sewa pertama untuk memulai."
      icon={
        <svg
          className={cn(
            "mx-auto",
            size === "sm"
              ? "h-8 w-8"
              : size === "md"
              ? "h-12 w-12"
              : "h-16 w-16"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      }
      action={
        onAddSewa
          ? {
              label: "Buat Sewa",
              onClick: onAddSewa,
            }
          : undefined
      }
      size={size}
    />
  );
};

// Additional empty states untuk modul lainnya
export const HistoryEmptyState: React.FC<{
  size?: "sm" | "md" | "lg";
}> = ({ size = "md" }) => {
  return (
    <EmptyState
      title="Tidak ada riwayat"
      description="Riwayat transaksi akan muncul di sini setelah ada aktivitas."
      icon={
        <svg
          className={cn(
            "mx-auto",
            size === "sm"
              ? "h-8 w-8"
              : size === "md"
              ? "h-12 w-12"
              : "h-16 w-16"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      size={size}
    />
  );
};

export const ReportEmptyState: React.FC<{
  size?: "sm" | "md" | "lg";
}> = ({ size = "md" }) => {
  return (
    <EmptyState
      title="Tidak ada laporan"
      description="Data laporan akan tersedia setelah ada transaksi."
      icon={
        <svg
          className={cn(
            "mx-auto",
            size === "sm"
              ? "h-8 w-8"
              : size === "md"
              ? "h-12 w-12"
              : "h-16 w-16"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
      size={size}
    />
  );
};

// Search empty state
export const SearchEmptyState: React.FC<{
  searchQuery: string;
  size?: "sm" | "md" | "lg";
}> = ({ searchQuery, size = "md" }) => {
  return (
    <EmptyState
      title="Hasil tidak ditemukan"
      description={`Tidak ada hasil untuk "${searchQuery}". Coba dengan kata kunci lain.`}
      icon={
        <svg
          className={cn(
            "mx-auto",
            size === "sm"
              ? "h-8 w-8"
              : size === "md"
              ? "h-12 w-12"
              : "h-16 w-16"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      size={size}
    />
  );
};
