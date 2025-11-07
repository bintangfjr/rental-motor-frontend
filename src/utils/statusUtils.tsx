// Utility function untuk mapping status motor
export const getMotorStatus = (status) => {
  const statusMap = {
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
export const getPenyewaStatus = (isBlacklisted) => {
  return isBlacklisted ? "blacklisted" : "active";
};
// Utility function untuk mapping status sewa
export const getSewaStatus = (status) => {
  const statusMap = {
    pending: "pending",
    active: "active",
    completed: "completed",
    cancelled: "cancelled",
    selesai: "completed",
    dibatalkan: "cancelled",
  };
  return statusMap[status.toLowerCase()] || "pending";
};
