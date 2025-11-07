import React, { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";

export interface FormTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  rows?: number;
  className?: string;
  helperText?: string;
  required?: boolean;
}

// Gunakan forwardRef supaya bisa dipakai dengan react-hook-form
const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      rows = 3,
      className,
      helperText,
      required,
      ...props
    },
    ref
  ) => {
    const { isDark } = useTheme();

    return (
      <div className="space-y-2">
        {label && (
          <label
            className={cn(
              "block text-sm font-medium transition-colors duration-200",
              isDark ? "text-dark-primary" : "text-gray-700",
              error && "text-red-600"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          className={cn(
            // Base styles
            "block w-full rounded-lg border shadow-sm transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            "sm:text-sm placeholder-gray-400",

            // Light mode styles
            !isDark && [
              "bg-white border-gray-300",
              "focus:border-blue-500 focus:ring-blue-500",
              "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
            ],

            // Dark mode styles
            isDark && [
              "bg-dark-secondary border-dark-border text-dark-primary",
              "focus:border-brand-blue focus:ring-brand-blue focus:ring-offset-dark-primary",
              "disabled:bg-dark-accent disabled:text-dark-muted disabled:cursor-not-allowed",
              "placeholder-dark-muted",
            ],

            // Error states
            error && [
              !isDark &&
                "border-red-500 focus:border-red-500 focus:ring-red-500",
              isDark &&
                "border-red-400 focus:border-red-400 focus:ring-red-400",
            ],

            // Disabled state
            props.disabled && [
              !isDark && "bg-gray-50 text-gray-500",
              isDark && "bg-dark-accent text-dark-muted",
            ],

            className
          )}
          {...props}
        />

        {/* Helper text dan error message */}
        <div className="space-y-1">
          {helperText && !error && (
            <p
              className={cn(
                "text-xs transition-colors duration-200",
                isDark ? "text-dark-muted" : "text-gray-500"
              )}
            >
              {helperText}
            </p>
          )}

          {error && (
            <p
              className={cn(
                "text-xs font-medium transition-colors duration-200",
                isDark ? "text-red-400" : "text-red-600"
              )}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
