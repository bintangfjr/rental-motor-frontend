import { StatusType } from "../components/common/StatusBadge";

// Utility function untuk mapping status motor
export const getMotorStatus = (status: string): StatusType => {
  const statusMap: Record<string, StatusType> = {
    available: "available",
    tersedia: "available",
    rented: "rented",
    disewa: "rented",
    maintenance: "maintenance",
    perawatan: "maintenance",
    unavailable: "inactive",
    tidak_tersedia: "inactive",
  };

  return statusMap[status.toLowerCase()] || "inactive";
};

// Utility function untuk mapping status penyewa
export const getPenyewaStatus = (isBlacklisted: boolean): StatusType => {
  return isBlacklisted ? "blacklisted" : "active";
};

// Utility function untuk mapping status sewa
export const getSewaStatus = (status: string): StatusType => {
  const statusMap: Record<string, StatusType> = {
    pending: "pending",
    active: "active",
    completed: "completed",
    cancelled: "cancelled",
    selesai: "completed",
    dibatalkan: "cancelled",
    berjalan: "active",
    overdue: "error",
    terlambat: "error",
  };

  return statusMap[status.toLowerCase()] || "pending";
};

// Utility function untuk mendapatkan warna status berdasarkan tema
export const getStatusColor = (
  status: StatusType,
  isDark: boolean = false
): string => {
  const lightColors: Record<StatusType, string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200",
    success: "bg-green-100 text-green-800 border-green-200",
    available: "bg-green-100 text-green-800 border-green-200",
    rented: "bg-blue-100 text-blue-800 border-blue-200",
    maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blacklisted: "bg-red-100 text-red-800 border-red-200",
  };

  const darkColors: Record<StatusType, string> = {
    active: "bg-green-900/20 text-green-300 border-green-800",
    inactive: "bg-gray-900/20 text-gray-300 border-gray-800",
    pending: "bg-yellow-900/20 text-yellow-300 border-yellow-800",
    completed: "bg-blue-900/20 text-blue-300 border-blue-800",
    cancelled: "bg-red-900/20 text-red-300 border-red-800",
    warning: "bg-yellow-900/20 text-yellow-300 border-yellow-800",
    error: "bg-red-900/20 text-red-300 border-red-800",
    success: "bg-green-900/20 text-green-300 border-green-800",
    available: "bg-green-900/20 text-green-300 border-green-800",
    rented: "bg-blue-900/20 text-blue-300 border-blue-800",
    maintenance: "bg-yellow-900/20 text-yellow-300 border-yellow-800",
    blacklisted: "bg-red-900/20 text-red-300 border-red-800",
  };

  return isDark ? darkColors[status] : lightColors[status];
};
