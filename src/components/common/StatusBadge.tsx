import React from "react";
import { cn } from "../../utils/cn";

export type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "cancelled"
  | "warning"
  | "error"
  | "success"
  | "available"
  | "rented"
  | "maintenance"
  | "blacklisted";

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className,
  size = "md",
}) => {
  const statusClasses: Record<StatusType, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
    available: "bg-green-100 text-green-800",
    rented: "bg-blue-100 text-blue-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    blacklisted: "bg-red-100 text-red-800",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        statusClasses[status],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

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
