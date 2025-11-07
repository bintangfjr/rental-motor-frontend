import React from "react";
import { useTheme } from "@/hooks/useTheme";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  type?: "spinner" | "dots" | "pulse" | "bars";
  overlay?: boolean;
  fullScreen?: boolean;
  color?: "blue" | "green" | "red" | "purple" | "white";
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  text = "Loading...",
  type = "spinner",
  overlay = false,
  fullScreen = false,
  color = "blue",
  className = "",
}) => {
  const { isDark } = useTheme();

  const sizeClasses = {
    sm: { container: "w-4 h-4", dot: "w-1 h-1", bar: "w-1 h-3" },
    md: { container: "w-8 h-8", dot: "w-2 h-2", bar: "w-2 h-6" },
    lg: { container: "w-12 h-12", dot: "w-3 h-3", bar: "w-3 h-8" },
    xl: { container: "w-16 h-16", dot: "w-4 h-4", bar: "w-4 h-10" },
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const colorClasses = {
    blue: isDark
      ? "border-t-blue-400 bg-blue-400"
      : "border-t-blue-600 bg-blue-600",
    green: isDark
      ? "border-t-green-400 bg-green-400"
      : "border-t-green-600 bg-green-600",
    red: isDark ? "border-t-red-400 bg-red-400" : "border-t-red-600 bg-red-600",
    purple: isDark
      ? "border-t-purple-400 bg-purple-400"
      : "border-t-purple-600 bg-purple-600",
    white: "border-t-white bg-white",
  };

  // Spinner animation component
  const Spinner = () => (
    <div
      className={`
        border-2 rounded-full animate-spin
        ${sizeClasses[size].container}
        ${
          isDark
            ? `border-dark-border ${colorClasses[color].split(" ")[0]}`
            : `border-gray-300 ${colorClasses[color].split(" ")[0]}`
        }
      `}
    />
  );

  // Dots animation component
  const Dots = () => (
    <div className={`flex space-x-1 ${sizeClasses[size].container}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`
            rounded-full animate-bounce
            ${sizeClasses[size].dot}
            ${colorClasses[color].split(" ")[1]}
          `}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );

  // Pulse animation component
  const Pulse = () => (
    <div
      className={`
        rounded-full animate-pulse
        ${sizeClasses[size].container}
        ${colorClasses[color].split(" ")[1]} opacity-20
      `}
    />
  );

  // Bars animation component (wave)
  const Bars = () => (
    <div className={`flex items-end space-x-1 ${sizeClasses[size].container}`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className={`
            animate-wave
            ${sizeClasses[size].bar}
            ${colorClasses[color].split(" ")[1]}
          `}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );

  const LoadingAnimation = () => {
    switch (type) {
      case "dots":
        return <Dots />;
      case "pulse":
        return <Pulse />;
      case "bars":
        return <Bars />;
      case "spinner":
      default:
        return <Spinner />;
    }
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <LoadingAnimation />
      {text && (
        <span
          className={`
            ${textSizes[size]}
            ${isDark ? "text-dark-secondary" : "text-gray-600"}
            transition-colors duration-200 font-medium
          `}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`
          fixed inset-0 z-50 flex items-center justify-center
          ${isDark ? "bg-dark-primary/95" : "bg-white/95"}
          backdrop-blur-sm transition-colors duration-200
        `}
      >
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div
        className={`
          absolute inset-0 z-40 flex items-center justify-center rounded-lg
          ${isDark ? "bg-dark-primary/90" : "bg-white/90"}
          backdrop-blur-sm transition-colors duration-200
        `}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
