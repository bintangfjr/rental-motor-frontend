import React from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme"; // Import useTheme hook

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "outline" | "filled" | "minimal";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  success?: boolean;
  loading?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  variant = "default",
  size = "md",
  fullWidth = true,
  success = false,
  loading = false,
  disabled = false,
  className,
  id,
  ...props
}) => {
  const { isDark } = useTheme(); // Get current theme
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  // ✅ Base classes
  const baseClasses =
    "block rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 resize-y border";

  // ✅ Variant classes untuk light dan dark mode
  const variantClasses = {
    default: cn(
      "bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500",
      isDark
        ? "border-dark-border bg-dark-secondary text-dark-primary focus:border-brand-blue focus:ring-brand-blue"
        : "border-gray-300"
    ),
    outline: cn(
      "border-2 bg-transparent text-gray-900 focus:border-blue-500 focus:ring-blue-500",
      isDark
        ? "border-dark-border text-dark-primary focus:border-brand-blue focus:ring-brand-blue"
        : "border-gray-200"
    ),
    filled: cn(
      "border-transparent text-gray-900 focus:border-blue-500 focus:ring-blue-500",
      isDark
        ? "bg-dark-accent text-dark-primary focus:bg-dark-secondary focus:border-brand-blue"
        : "bg-gray-100 focus:bg-white focus:border-blue-500"
    ),
    minimal: cn(
      "border-0 bg-transparent text-gray-900 focus:ring-2 focus:ring-blue-500 shadow-none",
      isDark
        ? "text-dark-primary focus:ring-brand-blue"
        : "text-gray-900 focus:ring-blue-500"
    ),
  };

  // ✅ Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs min-h-[60px]",
    md: "px-3 py-2 text-sm min-h-[80px]",
    lg: "px-4 py-3 text-base min-h-[100px]",
  };

  // ✅ State classes untuk light dan dark mode
  const stateClasses = cn(
    // Error state
    error &&
      cn(
        "border-red-500 focus:border-red-500 focus:ring-red-500",
        isDark ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-900"
      ),
    // Success state
    success &&
      cn(
        "border-green-500 focus:border-green-500 focus:ring-green-500",
        isDark ? "bg-green-900/20 text-green-300" : "bg-green-50 text-green-900"
      ),
    // Disabled state
    disabled &&
      cn(
        "opacity-50 cursor-not-allowed",
        isDark ? "bg-dark-accent text-dark-muted" : "bg-gray-100 text-gray-500"
      ),
    // Loading state
    loading && "cursor-wait"
  );

  // ✅ Width classes
  const widthClass = fullWidth ? "w-full" : "w-auto";

  // ✅ Label color classes untuk dark mode
  const labelColorClasses = cn(
    "block font-medium transition-colors duration-200",
    error
      ? isDark
        ? "text-red-400"
        : "text-red-700"
      : isDark
      ? "text-dark-secondary"
      : "text-gray-700",
    disabled && (isDark ? "text-dark-muted" : "text-gray-400")
  );

  // ✅ Helper text color classes untuk dark mode
  const helperTextColorClasses = cn(
    "text-sm transition-colors duration-200",
    error
      ? isDark
        ? "text-red-400"
        : "text-red-600"
      : isDark
      ? "text-dark-muted"
      : "text-gray-500"
  );

  return (
    <div className={cn("space-y-2", !fullWidth && "inline-block")}>
      {/* ✅ Label */}
      {label && (
        <label
          htmlFor={textareaId}
          className={cn(
            labelColorClasses,
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base"
          )}
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

      <div className="relative">
        {/* ✅ Textarea Element */}
        <textarea
          id={textareaId}
          disabled={disabled || loading}
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            stateClasses,
            widthClass,
            // Placeholder color untuk dark mode
            isDark ? "placeholder-dark-muted" : "placeholder-gray-400",
            className
          )}
          {...props}
        />

        {/* ✅ Loading Indicator */}
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div
              className={cn(
                "animate-spin rounded-full border-2 border-current border-t-transparent",
                error
                  ? isDark
                    ? "text-red-400"
                    : "text-red-500"
                  : isDark
                  ? "text-dark-muted"
                  : "text-gray-400",
                size === "sm" ? "h-3 w-3" : "h-4 w-4"
              )}
            />
          </div>
        )}
      </div>

      {/* ✅ Helper Text & Error Message */}
      {(error || helperText) && (
        <p className={helperTextColorClasses}>{error || helperText}</p>
      )}

      {/* ✅ Success Message */}
      {success && !error && (
        <p
          className={cn(
            "text-sm flex items-center gap-1",
            isDark ? "text-green-400" : "text-green-600"
          )}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Data valid
        </p>
      )}
    </div>
  );
};
