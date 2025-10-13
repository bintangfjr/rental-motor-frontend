import React from "react";
import { cn } from "../../utils/cn";

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

type SelectVariant = "default" | "outline" | "filled" | "minimal";
type SelectSize = "sm" | "md" | "lg";

interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "size" | "placeholder"
  > {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  variant?: SelectVariant;
  size?: SelectSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  success?: boolean;
  placeholder?: string; // ✅ Add placeholder to SelectProps
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  variant = "default",
  size = "md",
  fullWidth = true,
  leftIcon,
  rightIcon,
  loading = false,
  success = false,
  className,
  id,
  disabled,
  placeholder, // ✅ Destructure placeholder from props
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  // ✅ Base classes
  const baseClasses =
    "block rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2";

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
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
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
    <div className={cn("space-y-1", !fullWidth && "inline-block")}>
      {label && (
        <label
          htmlFor={selectId}
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
        {/* ✅ Left Icon */}
        {leftIcon && (
          <div
            className={cn(
              "absolute inset-y-0 left-0 flex items-center pointer-events-none",
              size === "sm" ? "pl-2" : "pl-3"
            )}
          >
            <span
              className={cn(
                "transition-colors duration-200",
                error ? "text-red-500" : "text-gray-400",
                size === "sm" ? "text-sm" : "text-base"
              )}
            >
              {leftIcon}
            </span>
          </div>
        )}

        {/* ✅ Select Element */}
        <select
          id={selectId}
          disabled={disabled || loading}
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            stateClasses,
            widthClass,
            leftIcon && (size === "sm" ? "pl-8" : "pl-10"),
            rightIcon && (size === "sm" ? "pr-8" : "pr-10"),
            loading && "pr-10",
            className
          )}
          {...props}
        >
          {/* ✅ Default option for placeholder */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* ✅ Options */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={option.disabled ? "text-gray-400" : ""}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* ✅ Right Icon / Loading / Custom Icon */}
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center pointer-events-none",
            size === "sm" ? "pr-2" : "pr-3"
          )}
        >
          {loading ? (
            <div
              className={cn(
                "animate-spin rounded-full border-2 border-current border-t-transparent",
                error ? "text-red-500" : "text-gray-400",
                size === "sm" ? "h-3 w-3" : "h-4 w-4"
              )}
            />
          ) : rightIcon ? (
            <span
              className={cn(
                "transition-colors duration-200",
                error ? "text-red-500" : "text-gray-400",
                size === "sm" ? "text-sm" : "text-base"
              )}
            >
              {rightIcon}
            </span>
          ) : (
            // ✅ Default dropdown arrow
            <svg
              className={cn(
                "transition-colors duration-200",
                error ? "text-red-500" : "text-gray-400",
                size === "sm" ? "h-3 w-3" : "h-4 w-4"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
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

// ✅ Export variant types untuk digunakan di komponen lain
export type { SelectVariant, SelectSize, SelectOption };
