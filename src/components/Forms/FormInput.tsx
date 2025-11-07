import React from "react";
import { useTheme } from "@/hooks/useTheme";

// Omit 'size' dari HTMLInputAttributes karena kita mau override dengan type kita sendiri
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = "default",
  size = "md",
  className,
  disabled,
  ...props
}) => {
  const { isDark } = useTheme();

  // Base classes untuk input
  const baseClasses =
    "block w-full transition-all duration-200 focus:outline-none focus:ring-2 border rounded-md";

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  // Variant classes untuk light dan dark mode
  const variantClasses = {
    default: {
      light:
        "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500",
      dark: "bg-dark-secondary border-dark-border text-dark-primary placeholder-dark-muted focus:border-brand-blue focus:ring-brand-blue",
    },
    filled: {
      light:
        "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 focus:bg-white",
      dark: "bg-dark-accent border-dark-border text-dark-primary placeholder-dark-muted focus:border-brand-blue focus:ring-brand-blue focus:bg-dark-secondary",
    },
    outlined: {
      light:
        "bg-transparent border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500",
      dark: "bg-transparent border-dark-border text-dark-primary placeholder-dark-muted focus:border-brand-blue focus:ring-brand-blue",
    },
  };

  // Error state classes
  const errorClasses = {
    light:
      "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900 placeholder-red-700",
    dark: "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-300 placeholder-red-500",
  };

  // Disabled state classes
  const disabledClasses = {
    light:
      "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-70",
    dark: "bg-dark-primary border-dark-border text-dark-muted cursor-not-allowed opacity-50",
  };

  // Get current classes based on state
  const getInputClasses = () => {
    if (disabled) {
      return isDark ? disabledClasses.dark : disabledClasses.light;
    }

    if (error) {
      return isDark ? errorClasses.dark : errorClasses.light;
    }

    const variantClass = variantClasses[variant];
    return isDark ? variantClass.dark : variantClass.light;
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label
          className={`block text-sm font-medium transition-colors duration-200 ${
            isDark ? "text-dark-primary" : "text-gray-700"
          } ${error && isDark ? "text-red-400" : error ? "text-red-600" : ""}`}
        >
          {label}
          {props.required && (
            <span
              className={isDark ? "text-red-400 ml-1" : "text-red-500 ml-1"}
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          {...props}
          disabled={disabled}
          className={`
            ${baseClasses}
            ${sizeClasses[size]}
            ${getInputClasses()}
            ${className || ""}
            ${disabled ? "cursor-not-allowed" : ""}
          `}
        />

        {/* Loading/Status Indicator (optional) */}
        {props.readOnly && (
          <div
            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
              isDark ? "text-dark-muted" : "text-gray-400"
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-1">
          <svg
            className={`w-4 h-4 flex-shrink-0 ${
              isDark ? "text-red-400" : "text-red-500"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
            {error}
          </p>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p
          className={`text-xs ${isDark ? "text-dark-muted" : "text-gray-500"}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

// Export default untuk kemudahan import
export default Input;
