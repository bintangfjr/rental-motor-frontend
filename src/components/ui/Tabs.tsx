import React, { useState } from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  className,
  variant = "default",
  size = "md",
  fullWidth = false,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const { isDark } = useTheme();

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  // Size classes
  const sizeClasses = {
    sm: "py-2 px-3 text-xs",
    md: "py-3 px-4 text-sm",
    lg: "py-4 px-5 text-base",
  };

  // Variant classes untuk light dan dark mode
  const variantClasses = {
    default: {
      active: {
        light: "border-brand-blue text-brand-blue",
        dark: "border-brand-blue text-brand-blue",
      },
      inactive: {
        light:
          "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
        dark: "border-transparent text-dark-muted hover:text-dark-secondary hover:border-dark-border",
      },
    },
    pills: {
      active: {
        light: "bg-brand-blue text-white border-transparent",
        dark: "bg-brand-blue text-white border-transparent",
      },
      inactive: {
        light: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent",
        dark: "bg-dark-accent text-dark-secondary hover:bg-dark-hover border-transparent",
      },
    },
    underline: {
      active: {
        light: "border-b-2 border-brand-blue text-brand-blue",
        dark: "border-b-2 border-brand-blue text-brand-blue",
      },
      inactive: {
        light:
          "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
        dark: "border-b-2 border-transparent text-dark-muted hover:text-dark-secondary hover:border-dark-border",
      },
    },
  };

  const getTabClasses = (tab: Tab, isActive: boolean) => {
    const variantClass = variantClasses[variant];
    const stateClass = isActive ? variantClass.active : variantClass.inactive;
    const themeClass = isDark ? stateClass.dark : stateClass.light;

    return cn(
      "flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-t-md",
      sizeClasses[size],
      fullWidth && "flex-1",
      variant === "pills" && "rounded-md border",
      variant !== "pills" && "border-b-2",
      themeClass,
      tab.disabled && "opacity-50 cursor-not-allowed",
      !tab.disabled && !isActive && "cursor-pointer"
    );
  };

  const getContainerClasses = () => {
    const baseClasses = {
      default: "border-b border-gray-200",
      pills: "gap-1 p-1 bg-gray-100 rounded-lg",
      underline: "border-b border-gray-200",
    };

    const darkClasses = {
      default: "border-dark-border",
      pills: "bg-dark-secondary",
      underline: "border-dark-border",
    };

    return cn(
      fullWidth ? "flex" : "inline-flex",
      variant === "pills" ? "rounded-lg p-1" : "",
      isDark ? darkClasses[variant] : baseClasses[variant]
    );
  };

  return (
    <div className={className}>
      <div className={getContainerClasses()}>
        <nav
          className={cn(
            fullWidth ? "flex w-full" : "flex",
            variant === "pills" ? "gap-1" : "gap-2"
          )}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                className={getTabClasses(tab, isActive)}
                disabled={tab.disabled}
                aria-selected={isActive}
                role="tab"
              >
                {/* Icon */}
                {tab.icon && (
                  <span
                    className={cn(
                      "flex-shrink-0",
                      size === "sm" ? "w-3 h-3" : "w-4 h-4"
                    )}
                  >
                    {tab.icon}
                  </span>
                )}

                {/* Label */}
                <span className="whitespace-nowrap">{tab.label}</span>

                {/* Badge */}
                {tab.badge && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center min-w-5 h-5 text-xs font-medium rounded-full",
                      isActive
                        ? isDark
                          ? "bg-white/20 text-white"
                          : "bg-white/20 text-white"
                        : isDark
                        ? "bg-dark-accent text-dark-secondary"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div
        className="mt-4 animate-fade-in"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTabContent}
      </div>
    </div>
  );
};
