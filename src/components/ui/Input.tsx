import React from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "filled" | "outlined";
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  variant = "default",
  disabled,
  ...props
}) => {
  const { isDark } = useTheme();
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  // Base classes untuk semua variant
  const baseClasses = cn(
    "block w-full rounded-md shadow-sm transition-all duration-200 sm:text-sm",
    "focus:outline-none focus:ring-2 focus:ring-offset-1",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    // Dark mode base
    isDark && "text-dark-primary"
  );

  // Variant classes
  const variantClasses = {
    default: cn(
      "border bg-white",
      "focus:border-blue-500 focus:ring-blue-500",
      "placeholder:text-gray-400",
      // Dark mode
      isDark && [
        "bg-dark-secondary border-dark-border",
        "focus:border-brand-blue focus:ring-brand-blue",
        "placeholder:text-dark-muted",
      ]
    ),
    filled: cn(
      "border border-transparent bg-gray-50",
      "focus:border-blue-500 focus:ring-blue-500 focus:bg-white",
      "placeholder:text-gray-500",
      // Dark mode
      isDark && [
        "bg-dark-accent border-transparent",
        "focus:border-brand-blue focus:ring-brand-blue focus:bg-dark-secondary",
        "placeholder:text-dark-muted",
      ]
    ),
    outlined: cn(
      "border-2 bg-transparent",
      "focus:border-blue-500 focus:ring-blue-500",
      "placeholder:text-gray-500",
      // Dark mode
      isDark && [
        "border-dark-border bg-transparent",
        "focus:border-brand-blue focus:ring-brand-blue",
        "placeholder:text-dark-muted",
      ]
    ),
  };

  // Error classes
  const errorClasses = cn(
    "border-red-500 focus:border-red-500 focus:ring-red-500",
    // Dark mode
    isDark && "border-red-400 focus:border-red-400 focus:ring-red-400"
  );

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "block text-sm font-medium transition-colors duration-200",
            isDark ? "text-dark-primary" : "text-gray-700",
            disabled && "opacity-50"
          )}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        disabled={disabled}
        className={cn(
          baseClasses,
          variantClasses[variant],
          error && errorClasses,
          !error && !disabled && "hover:border-gray-400",
          !error && !disabled && isDark && "hover:border-dark-border",
          className
        )}
        {...props}
      />

      {/* Error Message */}
      {error && (
        <p
          className={cn(
            "text-sm transition-colors duration-200",
            isDark ? "text-red-400" : "text-red-600"
          )}
        >
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p
          className={cn(
            "text-sm transition-colors duration-200",
            isDark ? "text-dark-muted" : "text-gray-500"
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
