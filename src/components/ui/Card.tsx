// src/components/ui/Card.tsx
import React from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  actions,
  padding = "md",
  shadow = "md",
  rounded = "lg",
}) => {
  const { theme } = useTheme();

  // Map padding sizes
  const paddingClasses = {
    none: "p-0",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-5 sm:p-8",
  };

  // Map shadow sizes
  const shadowClasses = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow",
    lg: "shadow-lg",
  };

  // Map rounded sizes
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
  };

  // Dynamic theme-based classes
  const themeClasses =
    theme === "dark"
      ? "bg-[#1E293B] border-[#2D3B50] text-gray-200" // dark mode
      : "bg-white border-gray-100 text-gray-700"; // light mode

  return (
    <div
      className={cn(
        themeClasses,
        "transition-all duration-300 hover:shadow-md",
        "w-full max-w-full border",
        paddingClasses[padding],
        shadowClasses[shadow],
        roundedClasses[rounded],
        className
      )}
    >
      {/* Header section */}
      {(title || actions) && (
        <div
          className={cn(
            "border-b pb-3 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between",
            theme === "dark" ? "border-[#2D3B50]" : "border-gray-200"
          )}
        >
          {title && (
            <h3
              className={cn(
                "text-lg font-semibold break-words",
                theme === "dark" ? "text-gray-100" : "text-gray-900",
                "text-center sm:text-left"
              )}
            >
              {title}
            </h3>
          )}
          {actions && (
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content section */}
      <div
        className={cn(
          "leading-relaxed overflow-hidden",
          theme === "dark" ? "text-gray-200" : "text-gray-700"
        )}
      >
        {children}
      </div>
    </div>
  );
};

// Sub-components
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}
export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
}) => <div className={cn("border-b pb-4 mb-4", className)}>{children}</div>;

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}
export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => <div className={cn("py-2", className)}>{children}</div>;

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}
export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
}) => <div className={cn("border-t pt-4 mt-4", className)}>{children}</div>;
