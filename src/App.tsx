import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider"; // ✅ Update import
import { useAuth } from "./hooks/useAuth"; // ✅ Update import ke hooks
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/layout/Layout";

// Lazy load pages
const Login = lazy(() => import("./pages/auth/Login"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));

// Motor
const MotorList = lazy(() => import("./pages/motor/MotorList"));
const MotorCreate = lazy(() => import("./pages/motor/MotorCreate"));
const MotorEdit = lazy(() => import("./pages/motor/MotorEdit"));
const MotorDetail = lazy(() => import("./pages/motor/MotorDetail"));

// Penyewa
const PenyewaList = lazy(() => import("./pages/penyewa/PenyewaList"));
const PenyewaCreate = lazy(() => import("./pages/penyewa/PenyewaCreate"));
const PenyewaEdit = lazy(() => import("./pages/penyewa/PenyewaEdit"));
const PenyewaDetail = lazy(() => import("./pages/penyewa/PenyewaDetail"));

// Sewa
const SewaList = lazy(() => import("./pages/sewa/SewaList"));
const SewaCreate = lazy(() => import("./pages/sewa/SewaCreate"));
const SewaEdit = lazy(() => import("./pages/sewa/SewaEdit"));
const SewaDetail = lazy(() => import("./pages/sewa/SewaDetail"));

// History & Report
const HistoryList = lazy(() => import("./pages/history/HistoryList"));
const ReportView = lazy(() => import("./pages/report/ReportView"));

// Settings
const ProfileSettings = lazy(() => import("./pages/settings/ProfileSettings"));
const NotificationSettings = lazy(
  () => import("./pages/settings/NotificationSettings")
);
const SecuritySettings = lazy(
  () => import("./pages/settings/SecuritySettings")
);

// Admin
const AdminList = lazy(() => import("./pages/admin/AdminList"));
const AdminCreate = lazy(() => import("./pages/admin/create"));
const AdminEdit = lazy(() => import("./pages/admin/edit"));

// Loading fallback
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// ProtectedRoute
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}> = ({ children, requireSuperAdmin = false }) => {
  const { admin, isAuthenticated, isLoading } = useAuth(); // ✅ Gunakan hook yang benar

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requireSuperAdmin && !admin?.is_super_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// GuestRoute
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth(); // ✅ Gunakan hook yang benar

  if (isLoading) return <LoadingSpinner />;

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

// AppRoutes
const AppRoutes: React.FC = () => (
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

        {/* History & Reports */}
        <Route path="histories" element={<HistoryList />} />
        <Route path="reports" element={<ReportView />} />

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
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

// Main App
const App: React.FC = () => (
  <Router>
    <ThemeProvider>
      <AuthProvider>
        {" "}
        {/* ✅ Gunakan AuthProvider yang benar */}
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  </Router>
);

export default App;
