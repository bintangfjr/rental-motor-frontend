import React, { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface FormTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void; // optional agar kompatibel dengan react-hook-form
  error?: string;
  rows?: number;
  className?: string;
}

// Gunakan forwardRef supaya bisa dipakai dengan react-hook-form
const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, value, onChange, error, rows = 3, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea"; // untuk debug di React DevTools

export default FormTextarea;
