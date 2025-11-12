import React, { useState, useEffect, useRef } from "react";
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
  const animationRef = useRef<number | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleToggle = () => {
    if (isAnimating) return; // Prevent multiple clicks during animation

    setIsAnimating(true);
    toggleTheme();

    // Smooth animation timeout
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 600);

    return () => clearTimeout(timer);
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
      togglePosition: isDark ? "left-7" : "left-0.5",
    },
    md: {
      container: "w-14 h-7",
      toggle: "w-5 h-5",
      icon: "w-3 h-3",
      text: "text-sm",
      togglePosition: isDark ? "left-8" : "left-0.5",
    },
    lg: {
      container: "w-16 h-8",
      toggle: "w-6 h-6",
      icon: "w-4 h-4",
      text: "text-base",
      togglePosition: isDark ? "left-9" : "left-0.5",
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
            "text-gray-600 dark:text-gray-300"
          )}
        >
          {isDark ? "Dark" : "Light"}
        </span>
      )}

      <button
        onClick={handleToggle}
        disabled={isAnimating}
        className={cn(
          "relative rounded-full transition-all duration-500 ease-out",
          "border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50",
          "transform-gpu will-change-transform overflow-hidden",
          "hover:scale-105 active:scale-95",
          isAnimating ? "scale-105" : "scale-100",
          currentSize.container,
          isDark
            ? "bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 border-purple-500/50 focus:ring-purple-400"
            : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 border-amber-300/50 focus:ring-amber-400",
          "disabled:opacity-70 disabled:cursor-not-allowed"
        )}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        aria-busy={isAnimating}
      >
        {/* Animated Background Overlay */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-opacity duration-700 ease-in-out",
            "bg-gradient-to-r from-blue-500/20 to-purple-600/20",
            isDark ? "opacity-100" : "opacity-0"
          )}
        />

        <div
          className={cn(
            "absolute inset-0 rounded-full transition-opacity duration-700 ease-in-out",
            "bg-gradient-to-r from-amber-300/20 to-orange-400/20",
            isDark ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Animated Sun/Moon Rays */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            isDark ? "opacity-0" : "opacity-100"
          )}
        >
          {/* Sun rays */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="w-full h-full relative">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-1 bg-yellow-300/40 rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${
                      i * 45
                    }deg) translateY(-8px)`,
                    transformOrigin: "center",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Toggle Handle dengan transform yang lebih smooth */}
        <div
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 ease-out",
            "bg-white rounded-full shadow-lg flex items-center justify-center",
            "border border-gray-200/80 backdrop-blur-sm",
            "will-change-transform",
            currentSize.toggle,
            currentSize.togglePosition,
            isAnimating && "scale-110"
          )}
        >
          {/* Sun Icon dengan animasi yang smooth */}
          <svg
            className={cn(
              "absolute transition-all duration-500 ease-out",
              "text-amber-500",
              currentSize.icon,
              isDark
                ? "opacity-0 scale-50 rotate-90"
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

          {/* Moon Icon dengan animasi yang smooth */}
          <svg
            className={cn(
              "absolute transition-all duration-500 ease-out",
              "text-indigo-600",
              currentSize.icon,
              isDark
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-50 -rotate-90"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>

          {/* Pulse Animation hanya saat animating */}
          {isAnimating && (
            <div
              className={cn(
                "absolute rounded-full bg-yellow-300/30 animate-ping",
                currentSize.toggle
              )}
              style={{ animationDuration: "800ms" }}
            />
          )}
        </div>

        {/* Floating Stars untuk Dark Mode */}
        {isDark && (
          <>
            <div
              className={cn(
                "absolute bg-white rounded-full animate-float",
                size === "sm" && "w-0.5 h-0.5",
                size === "md" && "w-1 h-1",
                size === "lg" && "w-1.5 h-1.5"
              )}
              style={{
                top: "20%",
                left: "30%",
                animationDelay: "0.1s",
                animationDuration: "3s",
              }}
            />
            <div
              className={cn(
                "absolute bg-white rounded-full animate-float",
                size === "sm" && "w-0.5 h-0.5",
                size === "md" && "w-1 h-1",
                size === "lg" && "w-1.5 h-1.5"
              )}
              style={{
                top: "60%",
                left: "20%",
                animationDelay: "0.7s",
                animationDuration: "2.5s",
              }}
            />
            <div
              className={cn(
                "absolute bg-white rounded-full animate-float",
                size === "sm" && "w-0.5 h-0.5",
                size === "md" && "w-1 h-1",
                size === "lg" && "w-1.5 h-1.5"
              )}
              style={{
                top: "40%",
                left: "70%",
                animationDelay: "1.3s",
                animationDuration: "3.2s",
              }}
            />
          </>
        )}

        {/* Cloud-like effect untuk Light Mode */}
        {!isDark && (
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              "bg-gradient-to-b from-white/10 to-transparent",
              "rounded-full"
            )}
          />
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
