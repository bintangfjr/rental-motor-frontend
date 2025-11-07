import React from "react";
import { useTheme } from "@/hooks/useTheme";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  helperText?: string;
  selectSize?: "sm" | "md" | "lg";
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  helperText,
  selectSize = "md",
  placeholder,
  className,
  disabled,
  ...props
}) => {
  const { isDark } = useTheme();

  // Size classes - menggunakan selectSize untuk menghindari konflik
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  // Base classes untuk select
  const baseClasses = `
    rm-input
    block w-full rounded-md border shadow-sm
    focus:outline-none focus:ring-2 focus:ring-offset-1
    transition-all duration-200
    ${sizeClasses[selectSize]}
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
  `;

  // Conditional classes berdasarkan state
  const stateClasses = error
    ? `border-red-300 focus:border-red-500 focus:ring-red-500 ${
        isDark ? "bg-dark-secondary border-red-600" : "bg-white border-red-300"
      }`
    : `border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
        isDark
          ? "bg-dark-secondary border-dark-border focus:border-brand-blue focus:ring-brand-blue"
          : "bg-white border-gray-300"
      }`;

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label
          className={`block font-medium transition-colors duration-200 ${
            isDark ? "text-dark-primary" : "text-gray-700"
          } ${selectSize === "sm" ? "text-sm" : "text-base"}`}
        >
          {label}
          {props.required && (
            <span className={isDark ? "text-red-400" : "text-red-500"}> *</span>
          )}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        <select
          {...props}
          disabled={disabled}
          className={`
            ${baseClasses}
            ${stateClasses}
            ${className || ""}
            appearance-none pr-10
            ${isDark ? "text-dark-primary" : "text-gray-900"}
          `}
        >
          {/* Placeholder option */}
          {placeholder && (
            <option value="" disabled selected={!props.value}>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className={
                isDark
                  ? "bg-dark-card text-dark-primary"
                  : "bg-white text-gray-900"
              }
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg
            className={`h-4 w-4 transition-colors duration-200 ${
              isDark ? "text-dark-secondary" : "text-gray-400"
            } ${disabled ? "opacity-50" : ""}`}
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
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p
          className={`text-sm font-medium transition-colors duration-200 ${
            isDark ? "text-red-400" : "text-red-600"
          }`}
        >
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p
          className={`text-sm transition-colors duration-200 ${
            isDark ? "text-dark-muted" : "text-gray-500"
          }`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Select;
