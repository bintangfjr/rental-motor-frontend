import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
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
  TruckIcon,
  MapIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
  // Icons untuk report submenu
  PresentationChartBarIcon,
  CalendarIcon,
  CubeIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
  onMobileNavigation?: (path: string) => void;
  screenSize?: "mobile" | "tablet" | "desktop" | "xl" | "2xl";
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  mobileOpen = false,
  onToggle,
  onItemClick,
  onMobileNavigation,
  screenSize = "desktop",
  isMobile = false,
}) => {
  const { admin, logout } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [motorsOpen, setMotorsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Motor submenu items
  const motorSubmenuItems = [
    {
      name: "Informasi",
      path: "/motors",
      icon: TruckIcon,
      description: "Daftar semua motor",
    },
    {
      name: "GPS & Tracking",
      path: "/motors/gps-tracking",
      icon: MapIcon,
      description: "Monitoring lokasi real-time",
    },
    {
      name: "Service",
      path: "/motors/service",
      icon: WrenchScrewdriverIcon,
      description: "Status service berdasarkan kilometer",
    },
  ];

  // Report submenu items
  const reportSubmenuItems = [
    {
      name: "Dashboard Statistik",
      path: "/reports/dashboard",
      icon: PresentationChartBarIcon,
      description: "Ringkasan statistik harian",
    },
    {
      name: "Laporan Bulanan",
      path: "/reports/monthly",
      icon: CalendarIcon,
      description: "Analisis data per bulan",
    },
    {
      name: "Penggunaan Motor",
      path: "/reports/motor-usage",
      icon: CubeIcon,
      description: "Statistik penggunaan motor",
    },
    {
      name: "Laporan Keuangan",
      path: "/reports/financial",
      icon: CurrencyDollarIcon,
      description: "Analisis pendapatan dan keuangan",
    },
  ];

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: ChartBarSquareIcon },
    {
      name: "Motor",
      path: "/motors",
      icon: CogIcon,
      hasSubmenu: true,
      submenuKey: "motors",
    },
    { name: "Penyewa", path: "/penyewas", icon: UserGroupIcon },
    { name: "Sewa", path: "/sewas", icon: DocumentTextIcon },
    { name: "History", path: "/histories", icon: ClockIcon },
    {
      name: "Report",
      path: "/reports",
      icon: ChartPieIcon,
      hasSubmenu: true,
      submenuKey: "reports",
    },
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

  const isMotorsActive = motorSubmenuItems.some((item) =>
    isActiveMenu(item.path)
  );

  const isReportsActive = reportSubmenuItems.some((item) =>
    isActiveMenu(item.path)
  );

  useEffect(() => {
    if (isSettingsActive) {
      setSettingsOpen(true);
    }
  }, [isSettingsActive]);

  useEffect(() => {
    if (isMotorsActive) {
      setMotorsOpen(true);
    }
  }, [isMotorsActive]);

  useEffect(() => {
    if (isReportsActive) {
      setReportsOpen(true);
    }
  }, [isReportsActive]);

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

  const handleMotorsToggle = () => {
    setMotorsOpen(!motorsOpen);
  };

  const handleReportsToggle = () => {
    setReportsOpen(!reportsOpen);
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      setShowLogoutConfirm(false);
      if (isMobile && onItemClick) {
        onItemClick();
      }
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogoutClick = () => {
    if (isMobile) {
      handleLogout();
    } else {
      setShowLogoutConfirm(true);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
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

  const getSubmenuPadding = () => {
    switch (screenSize) {
      case "2xl":
        return "px-7 py-2.5";
      case "xl":
        return "px-6 py-2";
      default:
        return "px-5 py-1.5";
    }
  };

  // Dark theme classes
  const headerBgClass = isDark
    ? "bg-dark-secondary border-dark-border"
    : "bg-white/50 border-gray-200/50";

  const adminInfoBgClass = isDark
    ? "bg-dark-accent border-dark-border"
    : "bg-gray-50/30 border-gray-200/50";

  const menuItemActiveClass = isDark
    ? "text-brand-blue bg-blue-900/20 font-medium"
    : "text-blue-600 bg-blue-50/80 font-medium";

  const menuItemInactiveClass = isDark
    ? "text-dark-secondary hover:text-dark-primary hover:bg-dark-hover"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50";

  const submenuItemActiveClass = isDark
    ? "text-brand-blue bg-blue-900/10 font-medium border-l-2 border-brand-blue"
    : "text-blue-600 bg-blue-50/60 font-medium border-l-2 border-blue-500";

  const submenuItemInactiveClass = isDark
    ? "text-dark-secondary hover:text-dark-primary hover:bg-dark-hover border-l-2 border-transparent"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 border-l-2 border-transparent";

  const textPrimaryClass = isDark ? "text-dark-primary" : "text-gray-900";

  const textSecondaryClass = isDark ? "text-dark-secondary" : "text-gray-500";

  const borderClass = isDark ? "border-dark-border" : "border-gray-200/50";

  const buttonHoverClass = isDark
    ? "hover:bg-dark-hover hover:text-dark-primary"
    : "hover:bg-gray-100/50 hover:text-gray-700";

  const logoutButtonClass = isDark
    ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
    : "text-red-600 hover:text-red-700 hover:bg-red-50";

  // Render submenu items dengan penanda sub halaman
  const renderSubmenuItems = (
    items: Array<{
      name: string;
      path: string;
      icon: React.ComponentType<any>;
      description?: string;
    }>,
    isOpen: boolean
  ) => (
    <div
      className={cn(
        "overflow-hidden transition-all duration-200",
        isOpen ? "max-h-96 mt-2" : "max-h-0"
      )}
    >
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              onClick={() => handleItemClick(item.path)}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 transition-colors duration-200 mx-2 backdrop-blur-sm border-l-2",
                  getSubmenuPadding(),
                  !isMobile && collapsed ? "justify-center" : "justify-start",
                  isActive ? submenuItemActiveClass : submenuItemInactiveClass
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
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "whitespace-nowrap block",
                      screenSize === "2xl" ? "text-sm" : "text-sm"
                    )}
                  >
                    {item.name}
                  </span>
                  {!isMobile && !collapsed && item.description && (
                    <span
                      className={cn(
                        "text-xs block truncate",
                        textSecondaryClass
                      )}
                    >
                      {item.description}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );

  // Render menu item dengan submenu
  const renderMenuWithSubmenu = (
    item: {
      name: string;
      path: string;
      icon: React.ComponentType<any>;
      hasSubmenu?: boolean;
      submenuKey?: string;
    },
    isOpen: boolean,
    onToggle: () => void,
    isActive: boolean
  ) => (
    <div>
      <button
        className={cn(
          "w-full flex items-center rounded-lg transition-all duration-200 mx-2 backdrop-blur-sm",
          getMenuPadding(),
          !isMobile && collapsed ? "justify-center" : "justify-between",
          isActive ? menuItemActiveClass : menuItemInactiveClass
        )}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div
          className={cn(
            "flex items-center space-x-3",
            !isMobile && collapsed && "justify-center"
          )}
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
        </div>
        {((!isMobile && !collapsed) || isMobile) && (
          <ChevronDownIcon
            className={cn(
              "transition-transform duration-200 flex-shrink-0",
              screenSize === "2xl" ? "w-5 h-5" : "w-4 h-4",
              isOpen ? "rotate-180" : ""
            )}
          />
        )}
      </button>

      {/* Render submenu berdasarkan jenis */}
      {item.submenuKey === "motors" &&
        renderSubmenuItems(motorSubmenuItems, isOpen)}
      {item.submenuKey === "reports" &&
        renderSubmenuItems(reportSubmenuItems, isOpen)}
    </div>
  );

  // JANGAN render sidebar jika mobileOpen adalah false di mobile
  if (isMobile && !mobileOpen) {
    return null;
  }

  return (
    <>
      {/* Sidebar dengan Glass Effect - Responsive */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r",
          isDark
            ? "bg-dark-secondary"
            : "bg-white/80 backdrop-blur-lg backdrop-saturate-150",
          borderClass,
          getSidebarWidth(),
          // Hanya tampilkan di mobile jika mobileOpen true
          isMobile && [
            "w-64 transform transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ],
          // Untuk desktop, selalu tampilkan
          !isMobile && "lg:flex"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between border-b",
            headerBgClass,
            borderClass,
            getPaddingSize()
          )}
        >
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "bg-brand-blue rounded-lg flex items-center justify-center",
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
                  "font-semibold whitespace-nowrap",
                  textPrimaryClass,
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
              className={cn(
                "p-1 transition-colors rounded-lg backdrop-blur-sm",
                buttonHoverClass,
                textSecondaryClass
              )}
              onClick={handleToggle}
              aria-label="Close sidebar"
            >
              <XMarkIcon className={getIconSize()} />
            </button>
          ) : (
            <button
              className={cn(
                "p-1 transition-colors rounded-lg backdrop-blur-sm",
                buttonHoverClass,
                textSecondaryClass
              )}
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
              "flex items-center border-b transition-all duration-300",
              adminInfoBgClass,
              borderClass,
              getPaddingSize(),
              !isMobile && collapsed && "justify-center"
            )}
          >
            <div
              className={cn(
                "bg-brand-blue rounded-full flex items-center justify-center text-white font-medium flex-shrink-0",
                screenSize === "2xl" ? "w-10 h-10 text-base" : "w-8 h-8 text-sm"
              )}
            >
              {displayInitial}
            </div>
            {((!isMobile && !collapsed) || isMobile) && (
              <div className="ml-3 min-w-0 flex-1">
                <p
                  className={cn(
                    "font-medium truncate",
                    textPrimaryClass,
                    getTextSize()
                  )}
                >
                  {displayName}
                </p>
                <p
                  className={cn(
                    "truncate",
                    textSecondaryClass,
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
                {item.hasSubmenu ? (
                  // Menu dengan dropdown (Motor & Report)
                  renderMenuWithSubmenu(
                    item,
                    item.submenuKey === "motors"
                      ? motorsOpen
                      : item.submenuKey === "reports"
                      ? reportsOpen
                      : false,
                    item.submenuKey === "motors"
                      ? handleMotorsToggle
                      : item.submenuKey === "reports"
                      ? handleReportsToggle
                      : () => {},
                    item.submenuKey === "motors"
                      ? isMotorsActive
                      : item.submenuKey === "reports"
                      ? isReportsActive
                      : false
                  )
                ) : (
                  // Menu biasa tanpa dropdown
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
                        isActive ? menuItemActiveClass : menuItemInactiveClass
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
                )}
              </li>
            ))}

            {/* Settings submenu */}
            <li className={cn("mt-6 pt-4 border-t mx-2", borderClass)}>
              <button
                className={cn(
                  "w-full flex items-center rounded-lg transition-all duration-200 mx-2 backdrop-blur-sm",
                  getMenuPadding(),
                  !isMobile && collapsed ? "justify-center" : "justify-between",
                  isSettingsActive ? menuItemActiveClass : menuItemInactiveClass
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

              {renderSubmenuItems(settingsItems, settingsOpen)}
            </li>
          </ul>
        </nav>

        {/* LOGOUT BUTTON */}
        <div className={cn("mt-auto border-t", borderClass)}>
          <button
            onClick={handleLogoutClick}
            className={cn(
              "w-full flex items-center transition-all duration-200 mx-2 rounded-lg backdrop-blur-sm",
              getMenuPadding(),
              !isMobile && collapsed ? "justify-center" : "justify-start",
              logoutButtonClass
            )}
            aria-label="Logout"
          >
            <ArrowRightOnRectangleIcon
              className={cn(
                "flex-shrink-0",
                getIconSize(),
                !isMobile && collapsed ? "mx-auto" : ""
              )}
            />
            {((!isMobile && !collapsed) || isMobile) && (
              <span className={cn("whitespace-nowrap", getTextSize())}>
                Keluar
              </span>
            )}
          </button>

          {/* Footer - hanya tampil di desktop */}
          {!isMobile && (
            <div
              className={cn(
                "transition-opacity duration-300 text-center",
                getPaddingSize(),
                collapsed && "opacity-0"
              )}
            >
              {!collapsed && (
                <p
                  className={cn(
                    textSecondaryClass,
                    screenSize === "2xl" ? "text-sm" : "text-xs"
                  )}
                >
                  v1.0.0
                </p>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal untuk Desktop */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={cn(
              "rounded-lg p-6 max-w-sm w-full mx-4",
              isDark ? "bg-dark-secondary" : "bg-white"
            )}
          >
            <h3
              className={cn(
                "text-lg font-semibold mb-2",
                isDark ? "text-dark-primary" : "text-gray-900"
              )}
            >
              Konfirmasi Logout
            </h3>
            <p
              className={cn(
                "mb-6",
                isDark ? "text-dark-secondary" : "text-gray-600"
              )}
            >
              Apakah Anda yakin ingin keluar dari sistem?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelLogout}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg transition-colors",
                  isDark
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                )}
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay dengan Blur Effect - HANYA untuk mobile */}
      {isMobile && mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 animate-in fade-in duration-300"
          onClick={handleToggle}
        >
          <div
            className={cn(
              "absolute inset-0 backdrop-blur-sm",
              isDark ? "bg-dark-primary/50" : "bg-white/5"
            )}
          ></div>
          <div
            className={cn(
              "absolute inset-0",
              isDark ? "bg-black/20" : "bg-black/5"
            )}
          ></div>
        </div>
      )}
    </>
  );
};
