// Application Constants
export const APP_CONFIG = {
  APP_NAME: 'Rental Motor Management',
  APP_VERSION: '1.0.0',
  COMPANY_NAME: 'PT. Rental Motor Indonesia',
  SUPPORT_EMAIL: 'support@rentalmotor.com',
  SUPPORT_PHONE: '+62 812-3456-7890',
} as const;

// API Constants
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  UPLOAD_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  RETRY_ATTEMPTS: 3,
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 20, 50, 100],
  MAX_PAGES_TO_SHOW: 5,
} as const;

// Motor Constants
export const MOTOR_STATUS = {
  TERSEDIA: 'tersedia',
  DISEWA: 'disewa',
  PERBAIKAN: 'perbaikan',
} as const;

export const MOTOR_STATUS_LABELS = {
  [MOTOR_STATUS.TERSEDIA]: 'Tersedia',
  [MOTOR_STATUS.DISEWA]: 'Disewa',
  [MOTOR_STATUS.PERBAIKAN]: 'Perbaikan',
} as const;

export const MOTOR_STATUS_COLORS = {
  [MOTOR_STATUS.TERSEDIA]: 'success',
  [MOTOR_STATUS.DISEWA]: 'warning',
  [MOTOR_STATUS.PERBAIKAN]: 'error',
} as const;

// Sewa Constants
export const SEWA_STATUS = {
  AKTIF: 'Aktif',
  SELESAI: 'Selesai',
} as const;

export const SEWA_STATUS_LABELS = {
  [SEWA_STATUS.AKTIF]: 'Aktif',
  [SEWA_STATUS.SELESAI]: 'Selesai',
} as const;

export const SEWA_STATUS_COLORS = {
  [SEWA_STATUS.AKTIF]: 'warning',
  [SEWA_STATUS.SELESAI]: 'success',
} as const;

// Tambahan Sewa Constants baru
export const SEWA_CONSTANTS = {
  MIN_DURASI: 1, // minimal 1 hari
  MAX_DURASI: 30, // maksimal 30 hari
  DENDA_RATE: 0.2, // 20% dari harga per hari
  NOTIFICATION_HOURS_BEFORE: 24, // notifikasi 24 jam sebelum kembali
  GRACE_PERIOD_HOURS: 2, // grace period 2 jam untuk keterlambatan
} as const;

export const SEWA_MESSAGES = {
  SUCCESS: {
    CREATE: 'Sewa berhasil ditambahkan',
    UPDATE: 'Sewa berhasil diperbarui',
    COMPLETE: 'Sewa berhasil diselesaikan',
    DELETE: 'Sewa berhasil dihapus',
  },
  ERROR: {
    MOTOR_UNAVAILABLE: 'Motor tidak tersedia untuk disewa',
    PENYEWA_BLACKLISTED: 'Penyewa dalam daftar hitam',
    PENYEWA_HAS_ACTIVE_RENTAL: 'Penyewa memiliki sewa aktif',
    SEWA_ALREADY_COMPLETED: 'Sewa sudah selesai',
    SEWA_NOT_FOUND: 'Sewa tidak ditemukan',
  },
} as const;

// Jaminan & Pembayaran
export const JAMINAN_TYPES = {
  KTP: 'KTP',
  KK: 'KK',
  SIM: 'SIM',
  MOTOR: 'Motor',
  DEPOSITO: 'Deposito',
} as const;

export const PEMBAYARAN_TYPES = {
  CASH: 'Cash',
  TRANSFER: 'Transfer',
} as const;

// Penyewa Constants
export const PENYEWA_STATUS = {
  AMAN: 'Aman',
  BLACKLIST: 'Blacklist',
} as const;

// History Constants
export const HISTORY_STATUS = {
  TEPAT_WAKTU: 'Tepat Waktu',
  TERLAMBAT: 'Terlambat',
} as const;

// Notification Constants
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// Date & Time Constants
export const DATE_FORMATS = {
  DISPLAY_DATE: 'DD/MM/YYYY',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
  DISPLAY_TIME: 'HH:mm',
  API_DATE: 'YYYY-MM-DD',
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ssZ',
} as const;

// Validation Constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
  PLAT_NOMOR_REGEX: /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{0,3}$/i,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 255,
  EMAIL_MAX_LENGTH: 255,
  ADDRESS_MAX_LENGTH: 500,

  // Alias supaya validator tetap jalan
  MOTOR_STATUS,
  PEMBAYARAN_TYPES,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  THEME_PREFERENCE: 'themePreference',
  LANGUAGE: 'language',
  SIDEBAR_STATE: 'sidebarState',
  TABLE_PREFERENCES: 'tablePreferences',
} as const;

// Route Paths
export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',

  // Motor Routes
  MOTORS: '/motors',
  MOTORS_CREATE: '/motors/create',
  MOTORS_EDIT: '/motors/:id/edit',
  MOTORS_DETAIL: '/motors/:id',

  // Penyewa Routes
  PENYEWAS: '/penyewas',
  PENYEWAS_CREATE: '/penyewas/create',
  PENYEWAS_EDIT: '/penyewas/:id/edit',
  PENYEWAS_DETAIL: '/penyewas/:id',

  // Sewa Routes
  SEWAS: '/sewas',
  SEWAS_CREATE: '/sewas/create',
  SEWAS_EDIT: '/sewas/:id/edit',
  SEWAS_DETAIL: '/sewas/:id',

  // History Routes
  HISTORIES: '/histories',

  // Report Routes
  REPORTS: '/reports',

  // Settings Routes
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_GPS_TRACKING: true,
  ENABLE_WHATSAPP_NOTIFICATIONS: true,
  ENABLE_ADVANCED_REPORTS: true,
  ENABLE_BULK_OPERATIONS: false,
} as const;

// Export semua constants
export default {
  APP_CONFIG,
  API_CONFIG,
  PAGINATION,
  MOTOR_STATUS,
  SEWA_STATUS,
  SEWA_CONSTANTS,
  SEWA_MESSAGES,
  JAMINAN_TYPES,
  PEMBAYARAN_TYPES,
  PENYEWA_STATUS,
  HISTORY_STATUS,
  NOTIFICATION_TYPES,
  DATE_FORMATS,
  VALIDATION,
  STORAGE_KEYS,
  ROUTE_PATHS,
  FEATURE_FLAGS,
};
