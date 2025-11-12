import { lazy } from "react";
import { ROUTE_PATHS } from "../utils/constants";

// Lazy load pages untuk code splitting
const Login = lazy(() => import("../pages/auth/Login"));
const Home = lazy(() => import("../pages/Home"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));

// Motor Routes
const MotorList = lazy(() => import("../pages/motor/MotorList"));
const MotorCreate = lazy(() => import("../pages/motor/MotorCreate"));
const MotorEdit = lazy(() => import("../pages/motor/MotorEdit"));
const MotorDetail = lazy(() => import("../pages/motor/MotorDetail"));

// Penyewa Routes
const PenyewaList = lazy(() => import("../pages/penyewa/PenyewaList"));
const PenyewaCreate = lazy(() => import("../pages/penyewa/PenyewaCreate"));
const PenyewaEdit = lazy(() => import("../pages/penyewa/PenyewaEdit"));
const PenyewaDetail = lazy(() => import("../pages/penyewa/PenyewaDetail"));

// Sewa Routes
const SewaList = lazy(() => import("../pages/sewa/SewaList"));
const SewaCreate = lazy(() => import("../pages/sewa/SewaCreate"));
const SewaEdit = lazy(() => import("../pages/sewa/SewaEdit"));
const SewaDetail = lazy(() => import("../pages/sewa/SewaDetail"));

// History & Report Routes
const HistoryList = lazy(() => import("../pages/history/HistoryList"));
const ReportView = lazy(() => import("../pages/report/DashboardReport"));

// Settings Routes
const ProfileSettings = lazy(() => import("../pages/settings/ProfileSettings"));
const SecuritySettings = lazy(
  () => import("../pages/settings/SecuritySettings")
);
const NotificationSettings = lazy(
  () => import("../pages/settings/NotificationSettings")
);

// Utility Pages
const NotFound = lazy(() => import("../pages/NotFound"));
const UnderMaintenance = lazy(() => import("../pages/UnderMaintenance"));

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  title?: string;
  description?: string;
  roles?: string[];
  layout?: "app" | "guest" | "none";
}

export const routes: RouteConfig[] = [
  // Public Routes
  {
    path: ROUTE_PATHS.LOGIN,
    component: Login,
    exact: true,
    protected: false,
    title: "Login - Rental Motor",
    layout: "guest",
  },

  // Protected Routes
  {
    path: ROUTE_PATHS.HOME,
    component: Home,
    exact: true,
    protected: true,
    title: "Beranda - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.DASHBOARD,
    component: Dashboard,
    exact: true,
    protected: true,
    title: "Dashboard - Rental Motor",
    layout: "app",
  },

  // Motor Routes
  {
    path: ROUTE_PATHS.MOTORS,
    component: MotorList,
    exact: true,
    protected: true,
    title: "Daftar Motor - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.MOTORS_CREATE,
    component: MotorCreate,
    exact: true,
    protected: true,
    title: "Tambah Motor - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.MOTORS_EDIT,
    component: MotorEdit,
    exact: true,
    protected: true,
    title: "Edit Motor - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.MOTORS_DETAIL,
    component: MotorDetail,
    exact: true,
    protected: true,
    title: "Detail Motor - Rental Motor",
    layout: "app",
  },

  // Penyewa Routes
  {
    path: ROUTE_PATHS.PENYEWAS,
    component: PenyewaList,
    exact: true,
    protected: true,
    title: "Daftar Penyewa - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.PENYEWAS_CREATE,
    component: PenyewaCreate,
    exact: true,
    protected: true,
    title: "Tambah Penyewa - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.PENYEWAS_EDIT,
    component: PenyewaEdit,
    exact: true,
    protected: true,
    title: "Edit Penyewa - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.PENYEWAS_DETAIL,
    component: PenyewaDetail,
    exact: true,
    protected: true,
    title: "Detail Penyewa - Rental Motor",
    layout: "app",
  },

  // Sewa Routes
  {
    path: ROUTE_PATHS.SEWAS,
    component: SewaList,
    exact: true,
    protected: true,
    title: "Daftar Sewa - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.SEWAS_CREATE,
    component: SewaCreate,
    exact: true,
    protected: true,
    title: "Tambah Sewa - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.SEWAS_EDIT,
    component: SewaEdit,
    exact: true,
    protected: true,
    title: "Edit Sewa - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.SEWAS_DETAIL,
    component: SewaDetail,
    exact: true,
    protected: true,
    title: "Detail Sewa - Rental Motor",
    layout: "app",
  },

  // History & Reports
  {
    path: ROUTE_PATHS.HISTORIES,
    component: HistoryList,
    exact: true,
    protected: true,
    title: "Riwayat Sewa - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.REPORTS,
    component: ReportView,
    exact: true,
    protected: true,
    title: "Laporan - Rental Motor",
    layout: "app",
  },

  // Settings Routes
  {
    path: ROUTE_PATHS.SETTINGS_PROFILE,
    component: ProfileSettings,
    exact: true,
    protected: true,
    title: "Pengaturan Profil - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.SETTINGS_SECURITY,
    component: SecuritySettings,
    exact: true,
    protected: true,
    title: "Pengaturan Keamanan - Rental Motor",
    layout: "app",
  },

  {
    path: ROUTE_PATHS.SETTINGS_NOTIFICATIONS,
    component: NotificationSettings,
    exact: true,
    protected: true,
    title: "Pengaturan Notifikasi - Rental Motor",
    layout: "app",
  },

  // Utility Routes
  {
    path: "/under-maintenance",
    component: UnderMaintenance,
    exact: true,
    protected: false,
    title: "Maintenance - Rental Motor",
    layout: "none",
  },

  // 404 Route - harus di akhir
  {
    path: "*",
    component: NotFound,
    protected: false,
    title: "Halaman Tidak Ditemukan - Rental Motor",
    layout: "none",
  },
];

// Helper functions untuk routing
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return routes.find((route) => route.path === path);
};

export const isProtectedRoute = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route ? route.protected ?? true : true;
};

export const getPageTitle = (path: string): string => {
  const route = getRouteConfig(path);
  return route?.title || "Rental Motor Management";
};

export const getRoutesByLayout = (layout: string): RouteConfig[] => {
  return routes.filter((route) => route.layout === layout);
};

// Route groups untuk navigation
export const navigationRoutes = {
  main: [
    { path: ROUTE_PATHS.DASHBOARD, label: "Dashboard", icon: "📊" },
    { path: ROUTE_PATHS.MOTORS, label: "Motor", icon: "🏍️" },
    { path: ROUTE_PATHS.PENYEWAS, label: "Penyewa", icon: "👥" },
    { path: ROUTE_PATHS.SEWAS, label: "Sewa", icon: "📝" },
  ],
  reports: [
    { path: ROUTE_PATHS.HISTORIES, label: "Riwayat", icon: "📋" },
    { path: ROUTE_PATHS.REPORTS, label: "Laporan", icon: "📈" },
  ],
  settings: [
    { path: ROUTE_PATHS.SETTINGS_PROFILE, label: "Profil", icon: "👤" },
    { path: ROUTE_PATHS.SETTINGS_SECURITY, label: "Keamanan", icon: "🔒" },
    {
      path: ROUTE_PATHS.SETTINGS_NOTIFICATIONS,
      label: "Notifikasi",
      icon: "🔔",
    },
  ],
};

export default routes;
