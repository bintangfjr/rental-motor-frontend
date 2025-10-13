import React from "react";
import { Input } from "../../ui/Input";
import { UseFormRegisterReturn } from "react-hook-form"; // ✅ Import type yang tepat

interface DateTimeInputProps {
  label: string;
  register: UseFormRegisterReturn; // ✅ Type yang tepat untuk register
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
}) => (
  <div>
    <Input
      label={label}
      type="datetime-local"
      {...register}
      error={error}
      required
      min={min}
      disabled={disabled}
    />
    <p className="text-xs text-gray-500 mt-1">
      {note}
      {disabledNote}
    </p>
  </div>
);

export default DateTimeInput;
