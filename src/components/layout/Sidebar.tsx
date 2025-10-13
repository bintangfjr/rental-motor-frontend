import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";

// Import Heroicons
import {
  ChartBarSquareIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartPieIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
  onMobileNavigation?: (path: string) => void;
  screenSize?: "mobile" | "tablet" | "desktop" | "xl" | "2xl";
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  mobileOpen = false,
  onToggle,
  onItemClick,
  onMobileNavigation,
  screenSize = "desktop",
}) => {
  const { admin } = useAuth();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: ChartBarSquareIcon },
    { name: "Motor", path: "/motors", icon: CogIcon },
    { name: "Penyewa", path: "/penyewas", icon: UserGroupIcon },
    { name: "Sewa", path: "/sewas", icon: DocumentTextIcon },
    { name: "History", path: "/histories", icon: ClockIcon },
    { name: "Report", path: "/reports", icon: ChartPieIcon },
    ...(admin?.is_super_admin
      ? [{ name: "Admin", path: "/admins", icon: UsersIcon }]
      : []),
  ];

  const settingsItems = [
    { name: "Profil", path: "/profile", icon: UserIcon },
    { name: "Notifikasi", path: "/notifications", icon: BellIcon },
    { name: "Keamanan", path: "/security", icon: ShieldCheckIcon },
  ];

  const isActiveMenu = useCallback(
    (path: string) => {
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  const isSettingsActive = settingsItems.some((item) =>
    isActiveMenu(item.path)
  );

  useEffect(() => {
    if (isSettingsActive) {
      setSettingsOpen(true);
    }
  }, [isSettingsActive]);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
  };

  const handleItemClick = (path: string) => {
    if (isMobile && onMobileNavigation) {
      onMobileNavigation(path);
    }

    if (isMobile && onItemClick) {
      onItemClick();
    }
  };

  const handleSettingsToggle = () => {
    setSettingsOpen(!settingsOpen);
  };

  // Fallback untuk nama display
  const displayName = admin?.nama_lengkap || admin?.username || "Admin";
  const displayInitial = displayName.charAt(0).toUpperCase();
  const userRole = admin?.is_super_admin
    ? "Super Admin"
    : admin?.role || "Admin";

  // Responsive sidebar width berdasarkan screen size
  const getSidebarWidth = () => {
    if (isMobile) {
      return "w-64";
    }

    switch (screenSize) {
      case "2xl":
        return collapsed ? "w-24" : "w-80";
      case "xl":
        return collapsed ? "w-20" : "w-72";
      default:
        return collapsed ? "w-16" : "w-64";
    }
  };

  // Responsive typography dan spacing
  const getTextSize = () => {
    switch (screenSize) {
      case "2xl":
        return "text-base";
      case "xl":
        return "text-sm";
      default:
        return "text-sm";
    }
  };

  const getIconSize = () => {
    switch (screenSize) {
      case "2xl":
        return "w-6 h-6";
      case "xl":
        return "w-5 h-5";
      default:
        return "w-5 h-5";
    }
  };

  const getPaddingSize = () => {
    switch (screenSize) {
      case "2xl":
        return "p-5";
      case "xl":
        return "p-4";
      default:
        return "p-4";
    }
  };

  const getMenuPadding = () => {
    switch (screenSize) {
      case "2xl":
        return "px-5 py-3";
      case "xl":
        return "px-4 py-2.5";
      default:
        return "px-4 py-2";
    }
  };

  return (
    <>
      {/* Sidebar dengan Glass Effect - Responsive */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-gray-200/30",
          // Glass effect background
          "bg-white/80 backdrop-blur-lg backdrop-saturate-150",
          // Responsive width
          getSidebarWidth(),
          // Mobile styles
          isMobile && [
            "w-64 transform transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ]
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between border-b border-gray-200/50 bg-white/50",
            getPaddingSize()
          )}
        >
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "bg-blue-600 rounded-lg flex items-center justify-center",
                screenSize === "2xl" ? "w-10 h-10" : "w-8 h-8"
              )}
            >
              <HomeIcon
                className={cn(
                  "text-white",
                  screenSize === "2xl" ? "w-6 h-6" : "w-5 h-5"
                )}
              />
            </div>
            {((!isMobile && !collapsed) || isMobile) && (
              <h2
                className={cn(
                  "font-semibold text-gray-900 whitespace-nowrap",
                  screenSize === "2xl" ? "text-xl" : "text-lg"
                )}
              >
                Rental Motor
              </h2>
            )}
          </div>

          {/* Close button for mobile, toggle button for desktop */}
          {isMobile ? (
            <button
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors hover:bg-gray-100/50 rounded-lg backdrop-blur-sm"
              onClick={handleToggle}
              aria-label="Close sidebar"
            >
              <XMarkIcon className={getIconSize()} />
            </button>
          ) : (
            <button
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors hover:bg-gray-100/50 rounded-lg backdrop-blur-sm"
              onClick={handleToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRightIcon
                className={cn(
                  "transition-transform duration-200",
                  screenSize === "2xl" ? "w-5 h-5" : "w-4 h-4",
                  collapsed ? "rotate-180" : ""
                )}
              />
            </button>
          )}
        </div>

        {/* Admin info */}
        {admin && (
          <div
            className={cn(
              "flex items-center border-b border-gray-200/50 transition-all duration-300 bg-gray-50/30",
              getPaddingSize(),
              !isMobile && collapsed && "justify-center"
            )}
          >
            <div
              className={cn(
                "bg-blue-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0",
                screenSize === "2xl" ? "w-10 h-10 text-base" : "w-8 h-8 text-sm"
              )}
            >
              {displayInitial}
            </div>
            {((!isMobile && !collapsed) || isMobile) && (
              <div className="ml-3 min-w-0 flex-1">
                <p
                  className={cn(
                    "text-gray-900 font-medium truncate",
                    getTextSize()
                  )}
                >
                  {displayName}
                </p>
                <p
                  className={cn(
                    "text-gray-500 truncate",
                    screenSize === "2xl" ? "text-sm" : "text-xs"
                  )}
                >
                  {userRole}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={() => handleItemClick(item.path)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-3 transition-colors duration-200 mx-2 rounded-lg backdrop-blur-sm",
                      getMenuPadding(),
                      !isMobile && collapsed
                        ? "justify-center"
                        : "justify-start",
                      isActive
                        ? "text-blue-600 bg-blue-50/80 font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                    )
                  }
                >
                  <item.icon
                    className={cn(
                      "flex-shrink-0",
                      getIconSize(),
                      !isMobile && collapsed ? "mx-auto" : ""
                    )}
                  />
                  {((!isMobile && !collapsed) || isMobile) && (
                    <span className={cn("whitespace-nowrap", getTextSize())}>
                      {item.name}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}

            {/* Settings submenu */}
            <li className="mt-6 pt-4 border-t border-gray-200/50 mx-2">
              <button
                className={cn(
                  "w-full flex items-center rounded-lg transition-all duration-200 mx-2 backdrop-blur-sm",
                  getMenuPadding(),
                  !isMobile && collapsed ? "justify-center" : "justify-between",
                  isSettingsActive
                    ? "text-blue-600 bg-blue-50/80 font-medium"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                )}
                onClick={handleSettingsToggle}
                aria-expanded={settingsOpen}
                aria-label="Pengaturan"
              >
                <div
                  className={cn(
                    "flex items-center space-x-3",
                    !isMobile && collapsed && "justify-center"
                  )}
                >
                  <CogIcon
                    className={cn(
                      "flex-shrink-0",
                      getIconSize(),
                      !isMobile && collapsed ? "mx-auto" : ""
                    )}
                  />
                  {((!isMobile && !collapsed) || isMobile) && (
                    <span className={cn("whitespace-nowrap", getTextSize())}>
                      Pengaturan
                    </span>
                  )}
                </div>
                {((!isMobile && !collapsed) || isMobile) && (
                  <ChevronDownIcon
                    className={cn(
                      "transition-transform duration-200 flex-shrink-0",
                      screenSize === "2xl" ? "w-5 h-5" : "w-4 h-4",
                      settingsOpen ? "rotate-180" : ""
                    )}
                  />
                )}
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  settingsOpen ? "max-h-40 mt-2" : "max-h-0"
                )}
              >
                <ul className="space-y-2">
                  {settingsItems.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.path}
                        onClick={() => handleItemClick(item.path)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center space-x-3 rounded-lg transition-colors duration-200 mx-2 backdrop-blur-sm",
                            getMenuPadding(),
                            !isMobile && collapsed
                              ? "justify-center"
                              : "justify-start",
                            isActive
                              ? "text-blue-600 bg-blue-50/80 font-medium"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                          )
                        }
                      >
                        <item.icon
                          className={cn(
                            "flex-shrink-0",
                            screenSize === "2xl" ? "w-5 h-5" : "w-4 h-4",
                            !isMobile && collapsed ? "mx-auto" : ""
                          )}
                        />
                        {((!isMobile && !collapsed) || isMobile) && (
                          <span
                            className={cn(
                              "whitespace-nowrap",
                              screenSize === "2xl" ? "text-sm" : "text-sm"
                            )}
                          >
                            {item.name}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </ul>
        </nav>

        {/* Footer - hanya tampil di desktop */}
        {!isMobile && (
          <div
            className={cn(
              "border-t border-gray-200/50 transition-opacity duration-300 bg-gray-50/30",
              getPaddingSize(),
              collapsed && "opacity-0"
            )}
          >
            {!collapsed && (
              <p
                className={cn(
                  "text-gray-500 text-center",
                  screenSize === "2xl" ? "text-sm" : "text-xs"
                )}
              >
                v1.0.0
              </p>
            )}
          </div>
        )}
      </aside>

      {/* Overlay dengan Blur Effect */}
      {isMobile && mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 animate-in fade-in duration-300"
          onClick={handleToggle}
        >
          {/* Background blur effect */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>

          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-black/5"></div>
        </div>
      )}
    </>
  );
};
