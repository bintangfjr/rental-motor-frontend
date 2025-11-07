import { MOTOR_STATUS, SEWA_STATUS, HISTORY_STATUS } from "./constants";

/**
 * Utility functions untuk membantu operasi umum
 */

// Type guards
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && !isNaN(value);
};

export const isDate = (value: unknown): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

// Array helpers
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
};

// Object helpers
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone((obj as any)[key]);
    }
  }
  return cloned;
};

// String helpers
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const camelToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Number helpers
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("id-ID").format(num);
};

export const parseNumber = (str: string): number => {
  return parseFloat(str.replace(/[^\d.-]/g, ""));
};

export const roundTo = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Date helpers
export const isValidDate = (date: unknown): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const getDaysBetween = (start: Date, end: Date): number => {
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isPast = (date: Date): boolean => {
  return date < new Date();
};

export const isFuture = (date: Date): boolean => {
  return date > new Date();
};

// Business logic helpers
export const calculateSewaDuration = (
  tglSewa: Date,
  tglKembali: Date,
): number => {
  return getDaysBetween(tglSewa, tglKembali);
};

export const calculateTotalHarga = (
  hargaPerHari: number,
  durasi: number,
): number => {
  return hargaPerHari * durasi;
};

export const calculateDenda = (
  tglKembaliJadwal: Date,
  tglSelesaiAktual: Date,
  hargaPerHari: number,
): number => {
  if (tglSelesaiAktual <= tglKembaliJadwal) return 0;

  const hariTerlambat = getDaysBetween(tglKembaliJadwal, tglSelesaiAktual);
  return hariTerlambat * (hargaPerHari * 0.2); // 20% dari harga per hari
};

export const getStatusSelesai = (
  tglKembaliJadwal: Date,
  tglSelesaiAktual: Date,
): string => {
  return tglSelesaiAktual <= tglKembaliJadwal
    ? HISTORY_STATUS.TEPAT_WAKTU
    : HISTORY_STATUS.TERLAMBAT;
};

export const isMotorAvailable = (status: string): boolean => {
  return status === MOTOR_STATUS.TERSEDIA;
};

export const canDeleteMotor = (
  status: string,
  hasActiveSewa: boolean,
): boolean => {
  return status !== MOTOR_STATUS.DISEWA && !hasActiveSewa;
};

export const canDeletePenyewa = (
  isBlacklisted: boolean,
  hasActiveSewa: boolean,
): boolean => {
  return !isBlacklisted && !hasActiveSewa;
};

// File helpers
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

export const isValidImageFile = (file: File): boolean => {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  return validTypes.includes(file.type);
};

export const isValidFileSize = (
  file: File,
  maxSize: number = 5 * 1024 * 1024,
): boolean => {
  return file.size <= maxSize;
};

// URL helpers
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

export const getUrlParams = (
  url: string = window.location.search,
): Record<string, string> => {
  const params = new URLSearchParams(url);
  const result: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
};

// Error handling helpers
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (isObject(error) && "message" in error)
    return String((error as any).message);
  return "Terjadi kesalahan yang tidak diketahui";
};

export const isApiError = (
  error: unknown,
): error is { response: { data: { message: string } } } => {
  return (
    isObject(error) &&
    "response" in error &&
    isObject((error as any).response) &&
    "data" in (error as any).response
  );
};

// Performance helpers
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default {
  // Type guards
  isObject,
  isArray,
  isString,
  isNumber,
  isDate,

  // Array helpers
  unique,
  chunk,
  groupBy,

  // Object helpers
  omit,
  pick,
  deepClone,

  // String helpers
  capitalize,
  camelToTitle,
  slugify,

  // Number helpers
  formatNumber,
  parseNumber,
  roundTo,

  // Date helpers
  isValidDate,
  addDays,
  addMonths,
  getDaysBetween,
  isToday,
  isPast,
  isFuture,

  // Business logic helpers
  calculateSewaDuration,
  calculateTotalHarga,
  calculateDenda,
  getStatusSelesai,
  isMotorAvailable,
  canDeleteMotor,
  canDeletePenyewa,

  // File helpers
  getFileExtension,
  isValidImageFile,
  isValidFileSize,

  // URL helpers
  buildQueryString,
  getUrlParams,

  // Error handling helpers
  getErrorMessage,
  isApiError,

  // Performance helpers
  debounce,
  throttle,
};
