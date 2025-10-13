// src/components/ui/Loading.tsx
import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  text = "Loading...",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`
          loading-spinner
          ${sizeClasses[size]}
        `}
      />
      {text && <span className="text-gray-600 text-sm">{text}</span>}
    </div>
  );
};

export default Loading;
