import React, { useState, ReactNode, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

interface LayoutProps {
  title?: string;
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<
    "mobile" | "tablet" | "desktop" | "xl" | "2xl"
  >("desktop");
  const location = useLocation();
  const navigate = useNavigate();

  // Detect screen size dengan breakpoint yang lebih detail
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setIsMobile(true);
        setScreenSize("mobile");
        setMobileSidebarOpen(false);
      } else if (width < 1024) {
        setIsMobile(false);
        setScreenSize("tablet");
        setMobileSidebarOpen(false);
      } else if (width < 1440) {
        setIsMobile(false);
        setScreenSize("desktop");
      } else if (width < 1920) {
        setIsMobile(false);
        setScreenSize("xl");
      } else {
        setIsMobile(false);
        setScreenSize("2xl");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
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

  // Handle mobile navigation
  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };

  // Main content margin calculations - OPTIMIZED FOR LARGE SCREENS
  const getMainContentMargin = () => {
    if (isMobile) {
      return "ml-0";
    }

    // Lebar sidebar yang responsive berdasarkan screen size
    if (screenSize === "2xl") {
      return sidebarCollapsed ? "xl:ml-24 2xl:ml-28" : "xl:ml-80 2xl:ml-96";
    } else if (screenSize === "xl") {
      return sidebarCollapsed ? "lg:ml-20 xl:ml-24" : "lg:ml-64 xl:ml-72";
    } else {
      return sidebarCollapsed ? "lg:ml-20" : "lg:ml-64";
    }
  };

  // Max width yang responsive untuk large screens
  const getMaxWidth = () => {
    switch (screenSize) {
      case "2xl":
        return "max-w-8xl"; // 88rem (1408px)
      case "xl":
        return "max-w-7xl"; // 80rem (1280px)
      case "desktop":
        return "max-w-7xl";
      case "tablet":
        return "max-w-6xl"; // 72rem (1152px)
      default:
        return "max-w-7xl";
    }
  };

  // Padding yang responsive
  const getContentPadding = () => {
    switch (screenSize) {
      case "2xl":
        return "px-8 2xl:px-12";
      case "xl":
        return "px-6 xl:px-8";
      default:
        return "px-4 sm:px-6 lg:px-8";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Sidebar */}
      <Sidebar
        collapsed={isMobile ? false : sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggle={toggleSidebar}
        onItemClick={closeMobileSidebar}
        onMobileNavigation={handleMobileNavigation}
        screenSize={screenSize}
      />

      {/* Main content area */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen
          transition-all duration-300 ease-in-out
          ${getMainContentMargin()}
          w-full min-w-0
        `}
      >
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <Header
            title={title}
            onMenuClick={toggleSidebar}
            showMobileMenu={isMobile}
            screenSize={screenSize}
          />
        </div>

        {/* Page content dengan max width yang responsive */}
        <main className="flex-1 py-6 lg:py-8 xl:py-10">
          <div
            className={`mx-auto ${getMaxWidth()} ${getContentPadding()} w-full`}
          >
            <div className={isMobile ? "pb-20" : ""}>
              <div
                key={location.pathname}
                className="animate-in slide-in-from-right-12 fade-in duration-300"
              >
                {children ?? <Outlet />}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className={isMobile ? "pb-16" : ""}>
          <Footer simplified={isMobile} screenSize={screenSize} />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 py-2 px-4 safe-area-bottom">
          <div className="flex justify-around items-center">
            <button
              onClick={toggleSidebar}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                mobileSidebarOpen
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
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
              className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600 transition-colors"
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
              className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600 transition-colors"
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
              className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600 transition-colors"
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

      {/* Background decorations - Optimized for large screens */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Background elements yang scale dengan screen size */}
        <div
          className={`absolute -top-40 -right-32 ${
            screenSize === "2xl"
              ? "w-96 h-96 opacity-30"
              : screenSize === "xl"
              ? "w-80 h-80 opacity-25"
              : isMobile
              ? "w-40 h-40 opacity-10"
              : "w-60 h-60 opacity-20"
          } bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-xl animate-float-slow`}
        ></div>

        <div
          className={`absolute -bottom-40 -left-32 ${
            screenSize === "2xl"
              ? "w-96 h-96 opacity-30"
              : screenSize === "xl"
              ? "w-80 h-80 opacity-25"
              : isMobile
              ? "w-40 h-40 opacity-10"
              : "w-60 h-60 opacity-20"
          } bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-xl animate-float-medium`}
        ></div>

        {/* Grid pattern yang responsive */}
        <div
          className={`
            absolute inset-0 
            bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] 
            ${
              screenSize === "2xl"
                ? "bg-[size:96px_96px]"
                : screenSize === "xl"
                ? "bg-[size:80px_80px]"
                : isMobile
                ? "bg-[size:32px_32px]"
                : "bg-[size:64px_64px]"
            }
            [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]
          `}
        ></div>
      </div>
    </div>
  );
};

export default Layout;
