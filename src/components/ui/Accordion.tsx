import React, { useState } from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "@/hooks/useTheme";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  multiple?: boolean;
  variant?: "default" | "bordered" | "shadow";
  size?: "sm" | "md" | "lg";
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  className,
  multiple = false,
  variant = "bordered",
  size = "md",
}) => {
  const { isDark } = useTheme();
  const [openItems, setOpenItems] = useState<string[]>(
    items.filter((item) => item.defaultOpen).map((item) => item.id)
  );

  const toggleItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item?.disabled) return;

    if (multiple) {
      setOpenItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setOpenItems((prev) => (prev.includes(itemId) ? [] : [itemId]));
    }
  };

  // Variant styles
  const variantStyles = {
    default: {
      light: "bg-transparent",
      dark: "bg-transparent",
    },
    bordered: {
      light: "border border-gray-200 rounded-lg bg-white",
      dark: "border border-dark-border rounded-lg bg-dark-card",
    },
    shadow: {
      light: "rounded-lg bg-white shadow-sm border border-gray-100",
      dark: "rounded-lg bg-dark-card shadow-lg border border-dark-border",
    },
  };

  // Size styles
  const sizeStyles = {
    sm: {
      button: "p-3",
      content: "p-3",
      text: "text-sm",
    },
    md: {
      button: "p-4",
      content: "p-4",
      text: "text-base",
    },
    lg: {
      button: "p-5",
      content: "p-5",
      text: "text-lg",
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        const isDisabled = item.disabled;

        return (
          <div
            key={item.id}
            className={cn(
              "transition-all duration-200",
              isDark ? currentVariant.dark : currentVariant.light,
              isDisabled && "opacity-50 cursor-not-allowed",
              isOpen && "ring-2 ring-opacity-20",
              isOpen && isDark && "ring-blue-400",
              isOpen && !isDark && "ring-blue-500"
            )}
          >
            <button
              className={cn(
                "flex items-center justify-between w-full text-left font-medium transition-colors duration-200",
                currentSize.button,
                currentSize.text,
                isDark
                  ? "text-dark-primary hover:bg-dark-hover"
                  : "text-gray-900 hover:bg-gray-50",
                isOpen && isDark && "bg-dark-hover",
                isOpen && !isDark && "bg-gray-50",
                isDisabled && "cursor-not-allowed hover:bg-transparent"
              )}
              onClick={() => toggleItem(item.id)}
              disabled={isDisabled}
              aria-expanded={isOpen}
              aria-disabled={isDisabled}
            >
              <span
                className={cn(
                  "font-semibold",
                  isDisabled && (isDark ? "text-dark-muted" : "text-gray-400")
                )}
              >
                {item.title}
              </span>
              <svg
                className={cn(
                  "w-4 h-4 transition-transform duration-200 flex-shrink-0",
                  isOpen && "rotate-180",
                  isDark ? "text-dark-secondary" : "text-gray-500",
                  isDisabled && (isDark ? "text-dark-muted" : "text-gray-300")
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div
                className={cn(
                  "border-t transition-all duration-200",
                  currentSize.content,
                  isDark
                    ? "border-dark-border text-dark-secondary"
                    : "border-gray-200 text-gray-700"
                )}
                aria-hidden={!isOpen}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
