import React from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";

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
  placeholder?: string;
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
  placeholder,
  ...props
}) => {
  const { isDark } = useTheme();
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  // ✅ Base classes
  const baseClasses =
    "block rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 border";

  // ✅ Variant classes dengan dark mode
  const variantClasses = {
    default: cn(
      "bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500",
      isDark &&
        "bg-dark-card border-dark-border text-dark-primary focus:border-brand-blue focus:ring-brand-blue"
    ),
    outline: cn(
      "border-2 border-gray-200 bg-transparent text-gray-900 focus:border-blue-500 focus:ring-blue-500",
      isDark &&
        "border-dark-border bg-transparent text-dark-primary focus:border-brand-blue focus:ring-brand-blue"
    ),
    filled: cn(
      "border-transparent bg-gray-100 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-blue-500",
      isDark &&
        "border-transparent bg-dark-accent text-dark-primary focus:bg-dark-card focus:border-brand-blue focus:ring-brand-blue"
    ),
    minimal: cn(
      "border-0 bg-transparent text-gray-900 focus:ring-2 focus:ring-blue-500 shadow-none",
      isDark &&
        "border-0 bg-transparent text-dark-primary focus:ring-2 focus:ring-brand-blue"
    ),
  };

  // ✅ Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  // ✅ State classes dengan dark mode
  const stateClasses = cn(
    // Error state
    error &&
      cn(
        "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50",
        isDark &&
          "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-900/20"
      ),
    // Success state
    success &&
      cn(
        "border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50",
        isDark &&
          "border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-900/20"
      ),
    // Disabled state
    disabled &&
      cn(
        "opacity-50 cursor-not-allowed bg-gray-100",
        isDark && "bg-dark-accent"
      ),
    // Loading state
    loading && "cursor-wait",
    // Normal border color
    !error && !success && cn("border-gray-300", isDark && "border-dark-border")
  );

  // ✅ Width classes
  const widthClass = fullWidth ? "w-full" : "w-auto";

  // ✅ Label text color dengan dark mode
  const labelColor = cn(
    error ? "text-red-700" : "text-gray-700",
    isDark && (error ? "text-red-400" : "text-dark-secondary"),
    disabled && cn("text-gray-400", isDark && "text-dark-muted")
  );

  // ✅ Icon color dengan dark mode
  const iconColor = cn(
    error ? "text-red-500" : "text-gray-400",
    isDark && (error ? "text-red-400" : "text-dark-muted")
  );

  // ✅ Helper text color dengan dark mode
  const helperTextColor = cn(
    error ? "text-red-600" : "text-gray-500",
    isDark && (error ? "text-red-400" : "text-dark-muted")
  );

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
            labelColor
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
                iconColor,
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
            className,
            // Additional dark mode styling untuk select
            isDark && "rm-input" // Menggunakan class dari CSS global
          )}
          {...props}
        >
          {/* ✅ Default option for placeholder */}
          {placeholder && (
            <option
              value=""
              disabled
              className={isDark ? "bg-dark-card text-dark-primary" : ""}
            >
              {placeholder}
            </option>
          )}

          {/* ✅ Options dengan dark mode support */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={cn(
                option.disabled ? "text-gray-400" : "",
                isDark &&
                  cn(
                    "bg-dark-card text-dark-primary",
                    option.disabled && "text-dark-muted"
                  )
              )}
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
                iconColor,
                size === "sm" ? "h-3 w-3" : "h-4 w-4"
              )}
            />
          ) : rightIcon ? (
            <span
              className={cn(
                "transition-colors duration-200",
                iconColor,
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
                iconColor,
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
            helperTextColor
          )}
        >
          {error || helperText}
        </p>
      )}

      {/* ✅ Success Message dengan dark mode */}
      {success && !error && (
        <p
          className={cn(
            "text-sm flex items-center gap-1 transition-colors duration-200",
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

// ✅ Export variant types untuk digunakan di komponen lain
export type { SelectVariant, SelectSize, SelectOption };
