import React from "react";
import { cn } from "../../utils/cn"; // Pastikan path ini sesuai

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
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  // ✅ Base classes
  const baseClasses =
    "block rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 resize-y";

  // ✅ Variant classes
  const variantClasses = {
    default:
      "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500",
    outline:
      "border-2 border-gray-200 bg-transparent text-gray-900 focus:border-blue-500 focus:ring-blue-500",
    filled:
      "border-transparent bg-gray-100 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-blue-500",
    minimal:
      "border-0 bg-transparent text-gray-900 focus:ring-2 focus:ring-blue-500 shadow-none",
  };

  // ✅ Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs min-h-[60px]",
    md: "px-3 py-2 text-sm min-h-[80px]",
    lg: "px-4 py-3 text-base min-h-[100px]",
  };

  // ✅ State classes
  const stateClasses = cn(
    error && "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50",
    success &&
      "border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50",
    disabled && "opacity-50 cursor-not-allowed bg-gray-100",
    loading && "cursor-wait"
  );

  // ✅ Width classes
  const widthClass = fullWidth ? "w-full" : "w-auto";

  return (
    <div className={cn("space-y-2", !fullWidth && "inline-block")}>
      {/* ✅ Label */}
      {label && (
        <label
          htmlFor={textareaId}
          className={cn(
            "block font-medium transition-colors duration-200",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            error ? "text-red-700" : "text-gray-700",
            disabled && "text-gray-400"
          )}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
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
                error ? "text-red-500" : "text-gray-400",
                size === "sm" ? "h-3 w-3" : "h-4 w-4"
              )}
            />
          </div>
        )}
      </div>

      {/* ✅ Helper Text & Error Message */}
      {(error || helperText) && (
        <p
          className={cn(
            "text-sm transition-colors duration-200",
            error ? "text-red-600" : "text-gray-500"
          )}
        >
          {error || helperText}
        </p>
      )}

      {/* ✅ Success Message */}
      {success && !error && (
        <p className="text-sm text-green-600 flex items-center gap-1">
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
