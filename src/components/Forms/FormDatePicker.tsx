import React, { useState } from "react";
import { cn } from "../../utils/cn";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface FormDatePickerProps {
  label?: string;
  value?: string; // ISO string "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Format value untuk input datetime-local sesuai browser
  const formattedValue = value
    ? dayjs.tz(value, "Asia/Jakarta").format("YYYY-MM-DDTHH:mm")
    : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localValue = e.target.value; // "YYYY-MM-DDTHH:mm"
    const isoValue = dayjs.tz(localValue, "Asia/Jakarta").toISOString(); // simpan sebagai ISO UTC
    onChange(isoValue);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label
          className={cn(
            "block text-sm font-medium",
            error ? "text-red-600" : "text-gray-700"
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="datetime-local"
          value={formattedValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "block w-full rounded-md border shadow-sm sm:text-sm",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
            isFocused && !error ? "ring-1 ring-blue-500" : "",
            className
          )}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
