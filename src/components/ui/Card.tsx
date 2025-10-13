// src/components/ui/Card.tsx
import React from "react";
import { cn } from "../../utils/cn";

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

  return (
    <div
      className={cn(
        "bg-white border border-gray-100",
        paddingClasses[padding],
        shadowClasses[shadow],
        roundedClasses[rounded],
        "transition-all duration-200 hover:shadow-md", // subtle hover effect
        "w-full", // ensure full width on mobile
        "max-w-full", // prevent overflow
        className
      )}
    >
      {/* Header section */}
      {(title || actions) && (
        <div
          className={cn(
            "border-b border-gray-200 pb-3 mb-4",
            "flex flex-col sm:flex-row sm:items-center sm:justify-between",
            "gap-3 sm:gap-0" // gap for mobile, no gap for desktop
          )}
        >
          {title && (
            <h3
              className={cn(
                "text-lg font-semibold text-gray-900",
                "text-center sm:text-left", // center on mobile, left align on desktop
                "break-words" // prevent long words from breaking layout
              )}
            >
              {title}
            </h3>
          )}
          {actions && (
            <div
              className={cn(
                "flex flex-wrap gap-2",
                "justify-center sm:justify-end", // center on mobile, right align on desktop
                "w-full sm:w-auto" // full width on mobile, auto on desktop
              )}
            >
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content section */}
      <div
        className={cn(
          "text-gray-700",
          "leading-relaxed",
          "overflow-hidden" // prevent content overflow
        )}
      >
        {children}
      </div>
    </div>
  );
};

// Optional: Sub-components for better structure
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
}) => (
  <div className={cn("border-b border-gray-200 pb-4 mb-4", className)}>
    {children}
  </div>
);

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
}) => (
  <div className={cn("border-t border-gray-200 pt-4 mt-4", className)}>
    {children}
  </div>
);
