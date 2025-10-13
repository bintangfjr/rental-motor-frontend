import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${
          className || ""
        } ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
        }`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
