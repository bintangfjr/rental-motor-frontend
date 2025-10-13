import React from "react";
import { cn } from "../../utils/cn";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className,
}) => {
  const variantClasses: Record<BadgeVariant, string> = {
    primary: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-cyan-100 text-cyan-800",
    default: "bg-gray-200 text-gray-900",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
