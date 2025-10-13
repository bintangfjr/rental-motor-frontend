import React from "react";
import { cn } from "../../utils/cn";

interface HeaderProps {
  title?: string;
  onMenuClick: () => void;
  showMobileMenu?: boolean;
  screenSize?: "mobile" | "tablet" | "desktop" | "xl" | "2xl";
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onMenuClick,
  showMobileMenu = false,
  screenSize = "desktop",
}) => {
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

  // Responsive height berdasarkan screen size
  const getHeaderHeight = () => {
    switch (screenSize) {
      case "2xl":
        return "h-20";
      case "xl":
        return "h-18";
      default:
        return "h-16";
    }
  };

  // Responsive title size berdasarkan screen size
  const getTitleSize = () => {
    switch (screenSize) {
      case "2xl":
        return "text-2xl";
      case "xl":
        return "text-xl";
      default:
        return "text-xl";
    }
  };

  // Responsive icon size berdasarkan screen size
  const getIconSize = () => {
    switch (screenSize) {
      case "2xl":
        return "w-7 h-7";
      case "xl":
        return "w-6 h-6";
      default:
        return "w-6 h-6";
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
        return "max-w-xs lg:max-w-md";
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div
        className={cn(
          "flex items-center justify-between w-full",
          getHeaderHeight(),
          getHeaderPadding()
        )}
      >
        <div className="flex items-center flex-1 min-w-0">
          {/* Menu button - Responsive untuk semua screen size */}
          <button
            onClick={onMenuClick}
            className={cn(
              "p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors",
              screenSize === "2xl" ? "p-2.5" : "p-2"
            )}
            aria-label="Toggle menu"
          >
            {showMobileMenu ? (
              // Hamburger icon for mobile
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
            ) : (
              // Menu icon for desktop
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
            )}
          </button>

          {/* Title dengan responsive design */}
          <div
            className={cn(
              "ml-3 lg:ml-4 flex-1 min-w-0",
              screenSize === "2xl" && "ml-4"
            )}
          >
            <h1
              className={cn(
                "font-semibold text-gray-900 truncate",
                getTitleSize(),
                getTitleMaxWidth()
              )}
            >
              {title || "Dashboard"}
            </h1>
            {/* Subtitle untuk layar besar */}
            {(screenSize === "xl" || screenSize === "2xl") && (
              <p className="text-sm text-gray-500 mt-1 truncate">
                Sistem Manajemen Rental Motor
              </p>
            )}
          </div>
        </div>

        {/* Desktop navigation items - Enhanced untuk layar besar */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Status indicator untuk layar besar */}
          {(screenSize === "xl" || screenSize === "2xl") && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                System Online
              </span>
            </div>
          )}

          {/* Notifications */}
          <button
            className={cn(
              "p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors relative",
              screenSize === "2xl" && "p-2.5"
            )}
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User profile dengan info lebih detail di layar besar */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "bg-blue-500 rounded-full flex items-center justify-center text-white font-medium",
                  screenSize === "2xl"
                    ? "w-10 h-10 text-base"
                    : "w-8 h-8 text-sm"
                )}
              >
                A
              </div>
              {(screenSize === "xl" || screenSize === "2xl") && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    Admin User
                  </span>
                  <span className="text-xs text-gray-500">Super Admin</span>
                </div>
              )}
            </div>

            {/* Dropdown arrow untuk layar besar */}
            {(screenSize === "xl" || screenSize === "2xl") && (
              <svg
                className="w-4 h-4 text-gray-400"
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
            )}
          </div>

          {/* Quick actions untuk layar sangat besar */}
          {screenSize === "2xl" && (
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 ml-2">
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
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
              <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors">
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

        {/* Mobile header actions */}
        <div className="flex lg:hidden items-center space-x-3">
          {/* Notification button for mobile */}
          <button className="p-2 text-gray-600 hover:text-gray-900 relative">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User avatar for mobile */}
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
        </div>
      </div>
    </header>
  );
};
