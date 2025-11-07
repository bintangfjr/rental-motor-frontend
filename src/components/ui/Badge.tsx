import React from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "default"
  | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className,
  size = "md",
}) => {
  const { isDark } = useTheme();

  // Size classes
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  // Variant classes untuk light dan dark mode
  const variantClasses: Record<BadgeVariant, string> = {
    primary: isDark
      ? "bg-blue-900/30 text-blue-300 border border-blue-800/50"
      : "bg-blue-100 text-blue-800 border border-blue-200",

    secondary: isDark
      ? "bg-gray-800 text-gray-300 border border-gray-700"
      : "bg-gray-100 text-gray-800 border border-gray-200",

    success: isDark
      ? "bg-green-900/30 text-green-300 border border-green-800/50"
      : "bg-green-100 text-green-800 border border-green-200",

    warning: isDark
      ? "bg-yellow-900/30 text-yellow-300 border border-yellow-800/50"
      : "bg-yellow-100 text-yellow-800 border border-yellow-200",

    danger: isDark
      ? "bg-red-900/30 text-red-300 border border-red-800/50"
      : "bg-red-100 text-red-800 border border-red-200",

    info: isDark
      ? "bg-cyan-900/30 text-cyan-300 border border-cyan-800/50"
      : "bg-cyan-100 text-cyan-800 border border-cyan-200",

    default: isDark
      ? "bg-dark-accent text-dark-secondary border border-dark-border"
      : "bg-gray-200 text-gray-900 border border-gray-300",

    outline: isDark
      ? "border border-dark-border text-dark-secondary bg-transparent"
      : "border border-gray-300 text-gray-700 bg-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors duration-200",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
