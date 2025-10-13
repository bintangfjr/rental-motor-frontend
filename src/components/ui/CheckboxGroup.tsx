import React from "react";

export interface CheckboxOption {
  value: string;
  label: string;
}

export interface CheckboxGroupProps {
  label?: string;
  options: CheckboxOption[];
  value?: string[]; // ✅ Jadikan optional
  onChange: (value: string[]) => void;
  direction?: "row" | "col";
  required?: boolean;
  error?: string;
  animation?: "scale" | "bounce" | "slide" | "fade";
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  value = [], // ✅ Berikan default value array kosong
  onChange,
  direction = "col",
  required = false,
  error,
  animation = "scale",
}) => {
  // ✅ Validasi value untuk memastikan selalu array
  const safeValue = Array.isArray(value) ? value : [];

  const handleChange = (val: string) => {
    if (safeValue.includes(val)) {
      onChange(safeValue.filter((v) => v !== val));
    } else {
      onChange([...safeValue, val]);
    }
  };

  // ✅ Animation classes based on type
  const getAnimationClass = () => {
    switch (animation) {
      case "scale":
        return "transition-all duration-200 ease-in-out hover:scale-105 active:scale-95";
      case "bounce":
        return "transition-all duration-300 ease-out hover:scale-110 active:scale-95";
      case "slide":
        return "transition-all duration-300 ease-in-out transform hover:translate-x-1";
      case "fade":
        return "transition-all duration-500 ease-in-out opacity-100 hover:opacity-80";
      default:
        return "transition-all duration-200 ease-in-out";
    }
  };

  // ✅ Checkbox animation styles
  const getCheckboxAnimation = (isChecked: boolean) => {
    const baseClasses =
      "h-4 w-4 rounded border-2 transition-all duration-300 ease-in-out transform";

    if (isChecked) {
      return `${baseClasses} border-blue-500 bg-blue-500 scale-110 shadow-md`;
    } else {
      return `${baseClasses} border-gray-300 bg-white hover:border-blue-400 hover:scale-105`;
    }
  };

  // ✅ Checkmark animation
  const Checkmark = ({ isChecked }: { isChecked: boolean }) => (
    <svg
      className={`w-3 h-3 text-white transition-all duration-300 ease-out ${
        isChecked ? "scale-100 opacity-100" : "scale-0 opacity-0"
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  // ✅ Pulse animation for required field
  const PulseDot = () => (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
    </span>
  );

  return (
    <div className="space-y-3">
      {/* ✅ Label dengan animasi */}
      {label && (
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-gray-700 transition-colors duration-200">
            {label}
          </label>
          {required && <PulseDot />}
        </div>
      )}

      {/* ✅ Checkbox container dengan animasi */}
      <div
        className={`flex gap-4 ${
          direction === "row" ? "flex-row flex-wrap" : "flex-col space-y-2"
        }`}
      >
        {options.map((opt, index) => {
          const isChecked = safeValue.includes(opt.value); // ✅ Gunakan safeValue

          return (
            <label
              key={opt.value}
              className={`
                inline-flex items-center gap-3 cursor-pointer group
                ${getAnimationClass()}
                p-2 rounded-lg border border-transparent
                hover:bg-blue-50 hover:border-blue-100
                ${isChecked ? "bg-blue-50 border-blue-200 shadow-sm" : ""}
              `}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* ✅ Animated Checkbox */}
              <div className="relative">
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => handleChange(opt.value)}
                  required={required && safeValue.length === 0} // ✅ Gunakan safeValue
                  className="sr-only"
                />
                <div className={getCheckboxAnimation(isChecked)}>
                  <div className="flex items-center justify-center w-full h-full">
                    <Checkmark isChecked={isChecked} />
                  </div>
                </div>

                {/* ✅ Ripple effect on click */}
                <div
                  className={`
                  absolute inset-0 rounded-full bg-blue-200 opacity-0 
                  transition-all duration-500 ease-out
                  ${isChecked ? "animate-ripple scale-150 opacity-0" : ""}
                `}
                />
              </div>

              {/* ✅ Label dengan animasi */}
              <span
                className={`
                text-sm font-medium transition-all duration-300 ease-in-out
                ${
                  isChecked
                    ? "text-blue-700 font-semibold transform translate-x-0.5"
                    : "text-gray-700 group-hover:text-gray-900"
                }
              `}
              >
                {opt.label}
              </span>

              {/* ✅ Hover indicator */}
              <div
                className={`
                w-1 h-1 rounded-full bg-blue-500 transition-all duration-300 ease-out
                ${
                  isChecked
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100"
                }
              `}
              />
            </label>
          );
        })}
      </div>

      {/* ✅ Error message dengan animasi */}
      {error && (
        <div className="animate-shake">
          <p className="text-red-500 text-sm font-medium flex items-center gap-2">
            <svg
              className="w-4 h-4 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* ✅ Selection counter */}
      {safeValue.length > 0 && ( // ✅ Gunakan safeValue
        <div className="flex items-center gap-2 text-xs text-gray-500 animate-fadeIn">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            {safeValue.length} terpilih
          </span>
          <span>dari {options.length} opsi</span>
        </div>
      )}
    </div>
  );
};
