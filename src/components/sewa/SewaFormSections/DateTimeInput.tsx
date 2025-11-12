import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { useTheme } from "../../../hooks/useTheme";

interface DateTimeInputProps {
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  min: string;
  disabled?: boolean;
  note: string;
  disabledNote?: string;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({
  label,
  register,
  error,
  min,
  disabled,
  note,
  disabledNote,
}) => {
  const { isDark } = useTheme();

  return (
    <div>
      <label
        className={`block text-sm font-medium mb-1 ${
          isDark ? "text-dark-secondary" : "text-gray-700"
        }`}
      >
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>

      <input
        type="datetime-local"
        {...register}
        min={min}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : isDark
            ? "border-dark-border bg-dark-secondary text-dark-primary focus:ring-blue-500 focus:border-blue-500"
            : "border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
        } ${
          disabled
            ? isDark
              ? "bg-dark-secondary/50 cursor-not-allowed opacity-70"
              : "bg-gray-100 cursor-not-allowed opacity-70"
            : ""
        }`}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}

      <p
        className={`text-xs mt-1 ${
          isDark ? "text-dark-muted" : "text-gray-500"
        }`}
      >
        {note}
        {disabledNote && (
          <span
            className={isDark ? "text-yellow-400 ml-1" : "text-yellow-600 ml-1"}
          >
            {disabledNote}
          </span>
        )}
      </p>
    </div>
  );
};

export default DateTimeInput;
