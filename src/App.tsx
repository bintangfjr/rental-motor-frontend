import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { NotificationProvider } from "./contexts/NotificationProvider";
import Layout from "./components/layout/Layout";

// Lazy load pages dengan error boundary
const lazyWithRetry = (componentImport: any) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      // Retry once if failed
      console.warn("Component load failed, retrying...", error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await componentImport();
    }
  });

// Lazy load pages
const Login = lazyWithRetry(() => import("./pages/auth/Login"));
const ForgotPassword = lazyWithRetry(
  () => import("./pages/auth/ForgotPassword")
);
const Register = lazyWithRetry(() => import("./pages/auth/Register"));
const Dashboard = lazyWithRetry(() => import("./pages/dashboard/Dashboard"));

// Motor
const MotorList = lazyWithRetry(() => import("./pages/motor/MotorList"));
const MotorCreate = lazyWithRetry(() => import("./pages/motor/MotorCreate"));
const MotorEdit = lazyWithRetry(() => import("./pages/motor/MotorEdit"));
const MotorDetail = lazyWithRetry(() => import("./pages/motor/MotorDetail"));
const MotorGpsTracking = lazyWithRetry(
  () => import("./pages/motor/MotorGpsTracking")
);
const MotorService = lazyWithRetry(() => import("./pages/motor/MotorService"));

// Penyewa
const PenyewaList = lazyWithRetry(() => import("./pages/penyewa/PenyewaList"));
const PenyewaCreate = lazyWithRetry(
  () => import("./pages/penyewa/PenyewaCreate")
);
const PenyewaEdit = lazyWithRetry(() => import("./pages/penyewa/PenyewaEdit"));
const PenyewaDetail = lazyWithRetry(
  () => import("./pages/penyewa/PenyewaDetail")
);

// Sewa
const SewaList = lazyWithRetry(() => import("./pages/sewa/SewaList"));
const SewaCreate = lazyWithRetry(() => import("./pages/sewa/SewaCreate"));
const SewaEdit = lazyWithRetry(() => import("./pages/sewa/SewaEdit"));
const SewaDetail = lazyWithRetry(() => import("./pages/sewa/SewaDetail"));

// History
const HistoryList = lazyWithRetry(() => import("./pages/history/HistoryList"));
const HistoryDetail = lazyWithRetry(
  () => import("./pages/history/HistoryDetail")
);

// Reports - 4 Separate Pages
const DashboardReport = lazyWithRetry(
  () => import("./pages/report/DashboardReport")
);
const MonthlyReport = lazyWithRetry(
  () => import("./pages/report/MonthlyReport")
);
const MotorUsageReport = lazyWithRetry(
  () => import("./pages/report/MotorUsageReport")
);
const FinancialReport = lazyWithRetry(
  () => import("./pages/report/FinancialReport")
);

// Settings
const ProfileSettings = lazyWithRetry(
  () => import("./pages/settings/ProfileSettings")
);
const NotificationSettings = lazyWithRetry(
  () => import("./pages/settings/NotificationSettings")
);
const SecuritySettings = lazyWithRetry(
  () => import("./pages/settings/SecuritySettings")
);

// Admin
const AdminList = lazyWithRetry(() => import("./pages/admin/AdminList"));
const AdminCreate = lazyWithRetry(() => import("./pages/admin/create"));
const AdminEdit = lazyWithRetry(() => import("./pages/admin/edit"));

// Additional pages
const Home = lazyWithRetry(() => import("./pages/Home"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const UnderMaintenance = lazyWithRetry(
  () => import("./pages/UnderMaintenance")
);

// Enhanced Loading fallback dengan PWA considerations
const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = "Memuat aplikasi...",
}) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400"></div>
    <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{message}</p>
    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
      Aplikasi Rental Motor
    </div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Terjadi Kesalahan
              </h2>
              <p className="text-gray-600 mb-4">
                Silakan refresh halaman atau coba lagi nanti.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Halaman
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// ProtectedRoute & GuestRoute
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}> = ({ children, requireSuperAdmin = false }) => {
  const { admin, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner message="Memeriksa autentikasi..." />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requireSuperAdmin && !admin?.is_super_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner message="Memeriksa autentikasi..." />;

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

// PWA Update Prompt Component
const PWAUpdatePrompt: React.FC = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setWaitingWorker(newWorker);
                setShowUpdatePrompt(true);
              }
            });
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const updateServiceWorker = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowUpdatePrompt(false);
    }
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold">Update Tersedia!</h3>
          <p className="text-sm opacity-90">
            Versi baru aplikasi tersedia. Update untuk mendapatkan fitur
            terbaru.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpdatePrompt(false)}
            className="px-3 py-1 text-sm border border-white rounded hover:bg-blue-700 transition-colors"
          >
            Nanti
          </button>
          <button
            onClick={updateServiceWorker}
            className="px-3 py-1 text-sm bg-white text-blue-600 rounded hover:bg-gray-100 transition-colors font-medium"
          >
            Update Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

// Network Status Component
const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm z-50">
      ❌ Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
    </div>
  );
};

// AppRoutes
const AppRoutes: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isAppReady) {
    return <LoadingSpinner message="Menyiapkan aplikasi..." />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route path="/home" element={<Home />} />
          <Route path="/maintenance" element={<UnderMaintenance />} />

          {/* Protected routes with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout title="Dashboard" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Motor */}
            <Route path="motors" element={<MotorList />} />
            <Route path="motors/create" element={<MotorCreate />} />
            <Route path="motors/:id/edit" element={<MotorEdit />} />
            <Route path="motors/:id" element={<MotorDetail />} />
            <Route path="motors/gps-tracking" element={<MotorGpsTracking />} />
            <Route path="motors/service" element={<MotorService />} />

            {/* Penyewa */}
            <Route path="penyewas" element={<PenyewaList />} />
            <Route path="penyewas/create" element={<PenyewaCreate />} />
            <Route path="penyewas/:id/edit" element={<PenyewaEdit />} />
            <Route path="penyewas/:id" element={<PenyewaDetail />} />

            {/* Sewa */}
            <Route path="sewas" element={<SewaList />} />
            <Route path="sewas/create" element={<SewaCreate />} />
            <Route path="sewas/:id/edit" element={<SewaEdit />} />
            <Route path="sewas/:id" element={<SewaDetail />} />

            {/* History */}
            <Route path="histories" element={<HistoryList />} />
            <Route path="histories/:id" element={<HistoryDetail />} />

            {/* Reports - 4 Separate Pages */}
            <Route path="reports" element={<DashboardReport />} />
            <Route path="reports/dashboard" element={<DashboardReport />} />
            <Route path="reports/monthly" element={<MonthlyReport />} />
            <Route path="reports/motor-usage" element={<MotorUsageReport />} />
            <Route path="reports/financial" element={<FinancialReport />} />

            {/* Settings */}
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="security" element={<SecuritySettings />} />

            {/* Admin (Super Admin only) */}
            <Route
              path="admins"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <AdminList />
                </ProtectedRoute>
              }
            />
            <Route
              path="admins/create"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <AdminCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="admins/:id/edit"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <AdminEdit />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // PWA installation prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      console.log("PWA installation available");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <WebSocketProvider>
              <div className="app">
                <NetworkStatus />
                <AppRoutes />
                <PWAUpdatePrompt />

                {/* Install PWA Prompt */}
                {isOnline && (
                  <div id="install-prompt" className="hidden">
                    {/* Will be shown by PWA capabilities */}
                  </div>
                )}
              </div>
            </WebSocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
