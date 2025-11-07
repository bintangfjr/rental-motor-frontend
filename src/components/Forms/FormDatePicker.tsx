import React, { useState } from "react";
import { cn } from "../../utils/cn";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useTheme } from "../../hooks/useTheme";

dayjs.extend(utc);
dayjs.extend(timezone);

interface FormDatePickerProps {
  label?: string;
  value?: string; // ISO string "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  min?: string; // ISO string untuk min date
  max?: string; // ISO string untuk max date
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  className,
  required = false,
  disabled = false,
  placeholder,
  min,
  max,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { isDark } = useTheme();

  // Format value untuk input datetime-local sesuai browser
  const formattedValue = value
    ? dayjs.tz(value, "Asia/Jakarta").format("YYYY-MM-DDTHH:mm")
    : "";

  // Format min dan max dates jika ada
  const formattedMin = min
    ? dayjs.tz(min, "Asia/Jakarta").format("YYYY-MM-DDTHH:mm")
    : undefined;

  const formattedMax = max
    ? dayjs.tz(max, "Asia/Jakarta").format("YYYY-MM-DDTHH:mm")
    : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localValue = e.target.value; // "YYYY-MM-DDTHH:mm"

    if (localValue) {
      const isoValue = dayjs.tz(localValue, "Asia/Jakarta").toISOString(); // simpan sebagai ISO UTC
      onChange(isoValue);
    } else {
      onChange(""); // Handle clear value
    }
  };

  // Base classes untuk input
  const baseInputClasses = cn(
    "rm-input block w-full rounded-md border shadow-sm transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-1",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "placeholder-gray-400",
    className
  );

  // Conditional classes berdasarkan state
  const inputStateClasses = cn(
    error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : isDark
      ? "border-dark-border focus:border-brand-blue focus:ring-brand-blue focus:ring-offset-dark-primary"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white",
    isFocused && !error && !isDark && "ring-1 ring-blue-500",
    isFocused && !error && isDark && "ring-1 ring-brand-blue"
  );

  // Label classes
  const labelClasses = cn(
    "block text-sm font-medium transition-colors duration-200",
    error ? "text-red-600" : isDark ? "text-dark-primary" : "text-gray-700",
    disabled && "opacity-50"
  );

  // Error text classes
  const errorClasses = cn(
    "text-sm transition-colors duration-200",
    isDark ? "text-red-400" : "text-red-600"
  );

  // Helper text classes
  const helperTextClasses = cn(
    "text-xs transition-colors duration-200",
    isDark ? "text-dark-muted" : "text-gray-500"
  );

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className={labelClasses}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {value && (
            <span className={helperTextClasses}>
              {dayjs.tz(value, "Asia/Jakarta").format("DD MMM YYYY HH:mm")}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <input
          type="datetime-local"
          value={formattedValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          min={formattedMin}
          max={formattedMax}
          className={cn(baseInputClasses, inputStateClasses)}
          // Styling khusus untuk datetime-local di dark mode
          style={
            isDark
              ? {
                  colorScheme: "dark",
                  backgroundColor: "#1e293b",
                  color: "#f8fafc",
                }
              : undefined
          }
        />

        {/* Custom calendar icon */}
        {!value && !disabled && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className={cn(
                "w-5 h-5 transition-colors duration-200",
                isDark ? "text-dark-muted" : "text-gray-400"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1">
          <svg
            className={cn("w-4 h-4", isDark ? "text-red-400" : "text-red-600")}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className={errorClasses}>{error}</p>
        </div>
      )}
    </div>
  );
};

// Export komponen yang sudah dioptimasi untuk penggunaan umum
export default FormDatePicker;
