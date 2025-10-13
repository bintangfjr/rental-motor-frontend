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
  };

  return statusMap[status.toLowerCase()] || "pending";
};
