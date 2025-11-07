import React from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";
import { getStatusColor } from "../../utils/statusUtils";

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
  variant?: "solid" | "outline";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className,
  size = "md",
  variant = "solid",
}) => {
  const { isDark } = useTheme();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  const variantClasses = {
    solid: getStatusColor(status, isDark),
    outline: isDark
      ? "bg-transparent border text-dark-primary border-dark-border"
      : "bg-transparent border text-gray-700 border-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border transition-colors duration-200",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {/* Status dot indicator */}
      <span
        className={cn("w-1.5 h-1.5 rounded-full mr-1.5", {
          "bg-green-500": [
            "active",
            "success",
            "available",
            "completed",
          ].includes(status),
          "bg-gray-500": ["inactive"].includes(status),
          "bg-yellow-500": ["pending", "warning", "maintenance"].includes(
            status
          ),
          "bg-blue-500": ["rented"].includes(status),
          "bg-red-500": ["cancelled", "error", "blacklisted"].includes(status),
        })}
      />
      {children}
    </span>
  );
};

export default StatusBadge;
