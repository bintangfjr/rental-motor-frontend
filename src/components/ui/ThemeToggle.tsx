import React, { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = "md",
  className,
  showLabel = false,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 600);
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          "rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse",
          size === "sm" && "w-12 h-6",
          size === "md" && "w-14 h-7",
          size === "lg" && "w-16 h-8",
          className
        )}
      />
    );
  }

  const sizeClasses = {
    sm: {
      container: "w-12 h-6",
      toggle: "w-4 h-4",
      icon: "w-2 h-2",
      text: "text-xs",
    },
    md: {
      container: "w-14 h-7",
      toggle: "w-5 h-5",
      icon: "w-3 h-3",
      text: "text-sm",
    },
    lg: {
      container: "w-16 h-8",
      toggle: "w-6 h-6",
      icon: "w-4 h-4",
      text: "text-base",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showLabel && (
        <span
          className={cn(
            "font-medium transition-colors duration-300",
            currentSize.text,
            "text-gray-600 dark:text-gray-400"
          )}
        >
          {isDark ? "Dark" : "Light"}
        </span>
      )}

      <button
        onClick={handleToggle}
        className={cn(
          "relative rounded-full transition-all duration-500 ease-in-out",
          "border-2 focus:outline-none focus:ring-2 focus:ring-offset-2",
          "transform-gpu will-change-transform",
          isAnimating ? "scale-110" : "scale-100",
          currentSize.container,
          isDark
            ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500 focus:ring-purple-500"
            : "bg-gradient-to-r from-amber-400 to-orange-400 border-amber-300 focus:ring-amber-500"
        )}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {/* Background Animation */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-opacity duration-500",
            "bg-gradient-to-r from-blue-400 to-purple-600",
            isDark ? "opacity-100" : "opacity-0"
          )}
        />

        <div
          className={cn(
            "absolute inset-0 rounded-full transition-opacity duration-500",
            "bg-gradient-to-r from-amber-300 to-orange-400",
            isDark ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Toggle Handle */}
        <div
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 ease-in-out",
            "bg-white rounded-full shadow-lg flex items-center justify-center",
            "border border-gray-200",
            currentSize.toggle,
            isDark
              ? "left-[calc(100%-theme(spacing.5))] translate-x-[-90%]"
              : "left-0.5 translate-x-0",
            size === "sm" && (isDark ? "left-7" : "left-0.5"),
            size === "md" && (isDark ? "left-8" : "left-0.5"),
            size === "lg" && (isDark ? "left-9" : "left-0.5")
          )}
        >
          {/* Sun Icon */}
          <svg
            className={cn(
              "absolute transition-all duration-500 text-amber-500",
              currentSize.icon,
              isDark
                ? "opacity-0 scale-0 rotate-90"
                : "opacity-100 scale-100 rotate-0"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>

          {/* Moon Icon */}
          <svg
            className={cn(
              "absolute transition-all duration-500 text-blue-600",
              currentSize.icon,
              isDark
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-0 -rotate-90"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>

          {/* Sparkle Effects */}
          {isAnimating && (
            <>
              <div
                className={cn(
                  "absolute rounded-full bg-yellow-300 animate-ping",
                  currentSize.icon
                )}
                style={{ animationDuration: "1s" }}
              />
              <div
                className={cn(
                  "absolute rounded-full bg-white animate-pulse",
                  currentSize.icon
                )}
                style={{ animationDuration: "2s" }}
              />
            </>
          )}
        </div>

        {/* Stars for Dark Mode */}
        {isDark && (
          <>
            <div
              className={cn(
                "absolute bg-white rounded-full animate-twinkle",
                size === "sm" && "w-0.5 h-0.5 top-1 left-3",
                size === "md" && "w-1 h-1 top-1 left-4",
                size === "lg" && "w-1 h-1 top-2 left-5"
              )}
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className={cn(
                "absolute bg-white rounded-full animate-twinkle",
                size === "sm" && "w-0.5 h-0.5 top-3 left-2",
                size === "md" && "w-1 h-1 top-4 left-3",
                size === "lg" && "w-1 h-1 top-5 left-4"
              )}
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
