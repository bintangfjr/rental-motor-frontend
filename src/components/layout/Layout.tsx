import React, { useState, ReactNode, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { useTheme } from "../../hooks/useTheme"; // ✅ Perbaiki import path

interface LayoutProps {
  title?: string;
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme(); // Sekarang seharusnya bekerja

  // State untuk animation
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === "fadeOut") {
      setTransitionStage("fadeIn");
      setDisplayLocation(location);
    }
  };

  // Detect screen size
  useEffect(() => {
    let timeoutId: number;

    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      if (width >= 1024) {
        setMobileSidebarOpen(false);
      }
    };

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(checkScreenSize, 100);
    };

    checkScreenSize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-dark-primary text-dark-primary"
          : "bg-gray-50 text-gray-900"
      } relative`}
    >
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          className={`
            flex-shrink-0 transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? "w-20" : "w-64"}
            h-screen sticky top-0 z-30
            ${
              isDark
                ? "bg-dark-secondary border-dark-border"
                : "bg-white/80 backdrop-blur-lg border-gray-200/30"
            }
            border-r
          `}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            mobileOpen={false}
            onToggle={toggleSidebar}
            onItemClick={closeMobileSidebar}
            onMobileNavigation={handleMobileNavigation}
            isMobile={false}
          />
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <>
          {mobileSidebarOpen && (
            <div
              className={`fixed inset-0 z-40 lg:hidden ${
                isDark ? "bg-black bg-opacity-70" : "bg-black bg-opacity-50"
              }`}
              onClick={closeMobileSidebar}
            />
          )}

          <div
            className={`
              fixed inset-y-0 left-0 z-50 transform transition-transform duration-300
              ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              w-64 border-r
              ${
                isDark
                  ? "bg-dark-secondary border-dark-border"
                  : "bg-white border-gray-200"
              }
            `}
          >
            <Sidebar
              collapsed={false}
              mobileOpen={mobileSidebarOpen}
              onToggle={toggleSidebar}
              onItemClick={closeMobileSidebar}
              onMobileNavigation={handleMobileNavigation}
              isMobile={true}
            />
          </div>
        </>
      )}

      {/* Main content area */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen min-w-0
          transition-all duration-300
          ${isMobile ? "w-full" : ""}
          ${mobileSidebarOpen ? "overflow-hidden" : ""}
        `}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-30 shadow-sm border-b ${
            isDark
              ? "bg-dark-secondary border-dark-border"
              : "bg-white border-gray-200"
          }`}
        >
          <Header
            title={title}
            onMenuClick={toggleSidebar}
            showMobileMenu={isMobile}
            sidebarCollapsed={sidebarCollapsed}
          />
        </div>

        {/* Page content dengan animation */}
        <main className="flex-1">
          <div className="py-6 lg:py-8">
            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
              <div className={isMobile ? "pb-20" : ""}>
                <div
                  className={`animate-${transitionStage}`}
                  onAnimationEnd={handleAnimationEnd}
                >
                  {children ?? <Outlet />}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className={isMobile ? "pb-16" : ""}>
          <Footer simplified={isMobile} />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <div
          className={`
            lg:hidden fixed bottom-0 left-0 right-0 z-40 
            py-2 px-4 safe-area-bottom border-t
            ${
              isDark
                ? "bg-dark-secondary border-dark-border"
                : "bg-white border-gray-200"
            }
            ${mobileSidebarOpen ? "opacity-0 pointer-events-none" : ""}
            transition-all duration-300
          `}
        >
          <div className="flex justify-around items-center">
            <button
              onClick={toggleSidebar}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                mobileSidebarOpen
                  ? "text-brand-blue"
                  : isDark
                  ? "text-dark-secondary hover:text-brand-blue"
                  : "text-gray-600 hover:text-brand-blue"
              }`}
            >
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span className="text-xs mt-1">Menu</span>
            </button>

            <button
              onClick={() => handleMobileNavigation("/dashboard")}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                isDark
                  ? "text-dark-secondary hover:text-brand-blue"
                  : "text-gray-600 hover:text-brand-blue"
              }`}
            >
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </button>

            <button
              onClick={() => handleMobileNavigation("/sewas")}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                isDark
                  ? "text-dark-secondary hover:text-brand-blue"
                  : "text-gray-600 hover:text-brand-blue"
              }`}
            >
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-xs mt-1">Sewa</span>
            </button>

            <button
              onClick={() => handleMobileNavigation("/profile")}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                isDark
                  ? "text-dark-secondary hover:text-brand-blue"
                  : "text-gray-600 hover:text-brand-blue"
              }`}
            >
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Simple background dengan dark theme support */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isDark
              ? "bg-dark-primary"
              : "bg-gradient-to-br from-blue-50/30 to-purple-50/30"
          }`}
        ></div>

        {/* Background pattern untuk dark mode */}
        {isDark && (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
