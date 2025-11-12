import React from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  title?: string;
  onMenuClick: () => void;
  showMobileMenu?: boolean;
  sidebarCollapsed?: boolean;
  screenSize?: "mobile" | "tablet" | "desktop" | "xl" | "2xl";
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onMenuClick,
  showMobileMenu = false,
  sidebarCollapsed = false,
  screenSize = "desktop",
}) => {
  const { isDark } = useTheme();

  // Responsive padding berdasarkan screen size
  const getHeaderPadding = () => {
    switch (screenSize) {
      case "2xl":
        return "px-8 2xl:px-12";
      case "xl":
        return "px-6 xl:px-8";
      case "tablet":
        return "px-5";
      default:
        return "px-4 sm:px-6 lg:px-8";
    }
  };

  // Consistent height untuk semua screen size
  const getHeaderHeight = () => {
    return "h-16";
  };

  // Responsive title size
  const getTitleSize = () => {
    switch (screenSize) {
      case "2xl":
        return "text-2xl";
      case "xl":
        return "text-xl";
      default:
        return "text-lg sm:text-xl";
    }
  };

  // Responsive icon size
  const getIconSize = () => {
    switch (screenSize) {
      case "2xl":
        return "w-7 h-7";
      case "xl":
        return "w-6 h-6";
      default:
        return "w-5 h-5 sm:w-6 sm:h-6";
    }
  };

  // Responsive max width untuk title
  const getTitleMaxWidth = () => {
    switch (screenSize) {
      case "2xl":
        return "max-w-2xl";
      case "xl":
        return "max-w-xl";
      case "desktop":
        return "max-w-lg";
      case "tablet":
        return "max-w-md";
      default:
        return "max-w-[180px] sm:max-w-xs lg:max-w-md";
    }
  };

  // Menu button margin berdasarkan state sidebar
  const getMenuButtonMargin = () => {
    if (showMobileMenu) return "mr-2";
    return sidebarCollapsed ? "mr-2" : "mr-3 lg:mr-4";
  };

  return (
    <header
      className={cn(
        "shadow-sm border-b sticky top-0 z-30 transition-colors duration-300",
        isDark
          ? "bg-dark-secondary border-dark-border"
          : "bg-white border-gray-200"
      )}
      style={{ contain: "layout style" }}
    >
      <div
        className={cn(
          "flex items-center justify-between w-full",
          getHeaderHeight(),
          getHeaderPadding()
        )}
      >
        {/* Left section - Title and menu button */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Menu button */}
          <button
            onClick={onMenuClick}
            className={cn(
              "flex-shrink-0 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              screenSize === "2xl" ? "p-2.5" : "p-2",
              getMenuButtonMargin(),
              isDark
                ? "text-dark-secondary hover:text-dark-primary hover:bg-dark-accent focus:ring-offset-dark-secondary"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
            style={{ willChange: "transform" }}
          >
            <svg
              className={getIconSize()}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Title dengan reserved space */}
          <div className={cn("flex-1 min-w-0", getMenuButtonMargin())}>
            <h1
              className={cn(
                "font-semibold truncate transition-colors duration-300",
                getTitleSize(),
                getTitleMaxWidth(),
                isDark ? "text-dark-primary" : "text-gray-900"
              )}
              style={{ contain: "layout" }}
            >
              {title || "Dashboard"}
            </h1>

            {/* Subtitle untuk layar besar */}
            {(screenSize === "xl" || screenSize === "2xl") && (
              <p
                className={cn(
                  "text-sm mt-0.5 truncate transition-colors duration-300",
                  isDark ? "text-dark-muted" : "text-gray-500"
                )}
                style={{ contain: "layout" }}
              >
                Sistem Manajemen Rental Motor
              </p>
            )}
          </div>
        </div>

        {/* Right section - Theme toggle dan User profile */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle
            size={screenSize === "2xl" ? "lg" : "md"}
            showLabel={false}
          />

          {/* Desktop Profile Section */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Status indicator untuk layar besar */}
            {(screenSize === "xl" || screenSize === "2xl") && (
              <div
                className={cn(
                  "flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-colors duration-300",
                  isDark
                    ? "bg-green-900 bg-opacity-20 border-green-800"
                    : "bg-green-50 border-green-200"
                )}
                style={{ contain: "layout" }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap transition-colors duration-300",
                    isDark ? "text-green-300" : "text-green-700"
                  )}
                >
                  System Online
                </span>
              </div>
            )}

            {/* User Profile - tanpa dropdown */}
            <div className="flex items-center space-x-3">
              {/* Avatar dengan gradient */}
              <div
                className={cn(
                  "rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 transition-all duration-300 shadow-lg",
                  screenSize === "2xl"
                    ? "w-10 h-10 text-base"
                    : "w-8 h-8 text-sm",
                  "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105"
                )}
                style={{ contain: "layout" }}
              >
                <span className="font-semibold">A</span>
              </div>

              {/* User info - hanya untuk layar besar */}
              {(screenSize === "xl" || screenSize === "2xl") && (
                <div
                  className="flex flex-col items-start min-w-0"
                  style={{ contain: "layout" }}
                >
                  <span
                    className={cn(
                      "text-sm font-semibold truncate max-w-[120px] transition-colors duration-300",
                      isDark ? "text-dark-primary" : "text-gray-900"
                    )}
                  >
                    Admin User
                  </span>
                  <span
                    className={cn(
                      "text-xs truncate max-w-[120px] transition-colors duration-300",
                      isDark ? "text-dark-muted" : "text-gray-500"
                    )}
                  >
                    Super Admin
                  </span>
                </div>
              )}
            </div>

            {/* Quick actions untuk layar sangat besar */}
            {screenSize === "2xl" && (
              <div
                className={cn(
                  "flex items-center space-x-2 border-l pl-4 ml-2 transition-colors duration-300",
                  isDark ? "border-dark-border" : "border-gray-200"
                )}
                style={{ contain: "layout" }}
              >
                <button
                  className={cn(
                    "p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    isDark
                      ? "text-dark-secondary hover:text-blue-400 hover:bg-blue-900 hover:bg-opacity-20 focus:ring-offset-dark-secondary"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  )}
                  aria-label="Add new rental"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
                <button
                  className={cn(
                    "p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                    isDark
                      ? "text-dark-secondary hover:text-green-400 hover:bg-green-900 hover:bg-opacity-20 focus:ring-offset-dark-secondary"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  )}
                  aria-label="Export report"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Profile Section - tanpa dropdown */}
          <div className="flex lg:hidden items-center">
            {/* User avatar untuk mobile */}
            <div
              className={cn(
                "rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 transition-all duration-300 shadow-md",
                "w-8 h-8 text-sm",
                "bg-gradient-to-br from-blue-500 to-purple-600"
              )}
              style={{ contain: "layout" }}
            >
              <span className="font-semibold">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
