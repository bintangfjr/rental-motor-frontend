import {
  APP_CONFIG,
  API_CONFIG,
  FEATURE_FLAGS,
  STORAGE_KEYS,
  ROUTE_PATHS,
} from "../utils/constants";

// Application Configuration
export const appConfig = {
  // Basic app info
  app: {
    name: APP_CONFIG.APP_NAME,
    version: APP_CONFIG.APP_VERSION,
    company: APP_CONFIG.COMPANY_NAME,
    supportEmail: APP_CONFIG.SUPPORT_EMAIL,
    supportPhone: APP_CONFIG.SUPPORT_PHONE,
  },

  // API Configuration
  api: {
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    uploadMaxSize: API_CONFIG.UPLOAD_MAX_SIZE,
    retryAttempts: API_CONFIG.RETRY_ATTEMPTS,

    // Endpoints
    endpoints: {
      auth: {
        login: "/auth/login",
        logout: "/auth/logout",
        profile: "/auth/profile",
        refresh: "/auth/refresh",
      },
      motors: "/motors",
      penyewas: "/penyewas",
      sewas: "/sewas",
      histories: "/histories",
      reports: "/reports",
      settings: {
        profile: "/settings/profile",
        password: "/settings/profile/password",
      },
    },
  },

  // Feature Flags
  features: {
    gpsTracking: FEATURE_FLAGS.ENABLE_GPS_TRACKING,
    whatsappNotifications: FEATURE_FLAGS.ENABLE_WHATSAPP_NOTIFICATIONS,
    advancedReports: FEATURE_FLAGS.ENABLE_ADVANCED_REPORTS,
    bulkOperations: FEATURE_FLAGS.ENABLE_BULK_OPERATIONS,
  },

  // UI Configuration
  ui: {
    theme: {
      default: "system" as "light" | "dark" | "system",
      storageKey: STORAGE_KEYS.THEME_PREFERENCE,
    },
    language: {
      default: "id",
      supported: ["id", "en"] as const,
      storageKey: STORAGE_KEYS.LANGUAGE,
    },
    sidebar: {
      collapsedWidth: 64,
      expandedWidth: 240,
      storageKey: STORAGE_KEYS.SIDEBAR_STATE,
    },
    table: {
      defaultPageSize: 10,
      pageSizes: [5, 10, 20, 50, 100],
      storageKey: STORAGE_KEYS.TABLE_PREFERENCES,
    },
  },

  // Notification Configuration
  notifications: {
    defaultDuration: 5000,
    maxVisible: 5,
    positions: [
      "top-right",
      "top-left",
      "bottom-right",
      "bottom-left",
    ] as const,
    defaultPosition: "top-right" as const,
  },

  // Form Configuration
  forms: {
    debounce: {
      search: 300,
      form: 500,
    },
    validation: {
      showErrors: "touched" as "always" | "touched" | "submit",
      scrollToError: true,
      focusFirstError: true,
    },
  },

  // Routing Configuration
  routing: {
    basename: "/",
    routes: ROUTE_PATHS,
    protectedRoutes: [
      ROUTE_PATHS.DASHBOARD,
      ROUTE_PATHS.MOTORS,
      ROUTE_PATHS.PENYEWAS,
      ROUTE_PATHS.SEWAS,
      ROUTE_PATHS.HISTORIES,
      ROUTE_PATHS.REPORTS,
      ROUTE_PATHS.SETTINGS_PROFILE,
      ROUTE_PATHS.SETTINGS_SECURITY,
      ROUTE_PATHS.SETTINGS_NOTIFICATIONS,
    ],
    publicRoutes: [ROUTE_PATHS.LOGIN],
  },

  // Business Rules Configuration
  business: {
    motor: {
      minYear: 1990,
      maxYear: new Date().getFullYear() + 1,
      statuses: ["tersedia", "disewa", "perbaikan"] as const,
      defaultStatus: "tersedia" as const,
    },
    sewa: {
      statuses: ["Aktif", "Selesai"] as const,
      jaminanTypes: ["KTP", "KK", "SIM", "Motor", "Deposito"] as const,
      pembayaranTypes: ["Cash", "Transfer"] as const,
      dendaRate: 0.2, // 20% dari harga per hari
      minDuration: 1, // 1 hari
      maxDuration: 365, // 1 tahun
    },
    penyewa: {
      blacklistReasons: [
        "Telat bayar",
        "Merusak motor",
        "Melanggar peraturan",
        "Lainnya",
      ] as const,
    },
    reports: {
      defaultDateRange: 30, // hari
      maxDateRange: 365, // hari
    },
  },

  // Security Configuration
  security: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
    session: {
      timeout: 24 * 60 * 60 * 1000, // 24 jam dalam milliseconds
      refreshInterval: 15 * 60 * 1000, // 15 menit
    },
  },

  // Localization Configuration
  localization: {
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    datetimeFormat: "DD/MM/YYYY HH:mm",
    currency: "IDR",
    numberFormat: "id-ID",
  },
} as const;

// Environment-specific configuration
export const getEnvConfig = () => {
  const env = import.meta.env.MODE || "development";

  const envConfigs = {
    development: {
      api: {
        baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
        debug: true,
      },
      features: {
        enableDebugTools: true,
        logApiCalls: true,
      },
    },
    production: {
      api: {
        baseUrl:
          import.meta.env.VITE_API_URL || "https://api.rentalmotor.com/api",
        debug: false,
      },
      features: {
        enableDebugTools: false,
        logApiCalls: false,
      },
    },
    test: {
      api: {
        baseUrl: "http://localhost:3001/api",
        debug: true,
      },
      features: {
        enableDebugTools: true,
        logApiCalls: true,
      },
    },
  };

  return {
    ...appConfig,
    env,
    ...(envConfigs[env as keyof typeof envConfigs] || envConfigs.development),
  };
};

// Type exports
export type AppConfig = typeof appConfig;
export type FeatureFlags = typeof appConfig.features;
export type UIConfig = typeof appConfig.ui;
export type BusinessConfig = typeof appConfig.business;

export default appConfig;
