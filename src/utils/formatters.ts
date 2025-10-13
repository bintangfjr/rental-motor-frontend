import { DATE_FORMATS } from "./constants";

/**
 * Formatting utilities untuk berbagai tipe data
 */

// Currency formatting
export const formatCurrency = (
  value: number,
  currency: string = "IDR",
  locale: string = "id-ID"
): string => {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCurrencyCompact = (
  value: number,
  currency: string = "IDR",
  locale: string = "id-ID"
): string => {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatNumber = (
  value: number,
  locale: string = "id-ID"
): string => {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat(locale).format(value);
};

export const formatDecimal = (
  value: number,
  decimals: number = 2,
  locale: string = "id-ID"
): string => {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (
  value: number,
  decimals: number = 1,
  locale: string = "id-ID"
): string => {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

// Date and time formatting
export const formatDate = (
  date: Date | string | null | undefined,
  format: string = DATE_FORMATS.DISPLAY_DATE,
  locale: string = "id-ID"
): string => {
  if (!date) return "-";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "-";

  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return formatter.format(dateObj);
};

export const formatDateTime = (
  date: Date | string | null | undefined,
  format: string = DATE_FORMATS.DISPLAY_DATETIME,
  locale: string = "id-ID"
): string => {
  if (!date) return "-";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "-";

  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(dateObj);
};

export const formatTime = (
  date: Date | string | null | undefined,
  locale: string = "id-ID"
): string => {
  if (!date) return "-";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "-";

  const formatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(dateObj);
};

export const formatDateLong = (
  date: Date | string | null | undefined,
  locale: string = "id-ID"
): string => {
  if (!date) return "-";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "-";

  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatter.format(dateObj);
};

// Format date for backend (YYYY-MM-DD format)
export const formatDateForBackend = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Format datetime for backend (YYYY-MM-DDTHH:mm format)
export const formatDateTimeForBackend = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Format datetime for input (datetime-local)
export const formatDateTimeForInput = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return "masa depan";
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds} detik yang lalu`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} hari yang lalu`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} bulan yang lalu`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} tahun yang lalu`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes <= 0) return "0 menit";

  if (minutes < 60) {
    return `${minutes} menit`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours} jam ${remainingMinutes} menit`
      : `${hours} jam`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours === 0) {
    return `${days} hari`;
  }

  return `${days} hari ${remainingHours} jam`;
};

// NEW: Calculate duration from date inputs with validation
export const calculateDurationFromInput = (
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  unit: "minutes" | "hours" | "days" = "minutes"
): number => {
  if (!startDate || !endDate) return 0;

  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  // Ensure end date is after start date
  if (end <= start) return 0;

  const diffInMs = end.getTime() - start.getTime();

  switch (unit) {
    case "minutes":
      return Math.floor(diffInMs / (1000 * 60));
    case "hours":
      return Math.floor(diffInMs / (1000 * 60 * 60));
    case "days":
      return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    default:
      return Math.floor(diffInMs / (1000 * 60));
  }
};

// NEW: Calculate duration in days (minimal 1 hari)
export const calculateDurationInDays = (
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): number => {
  if (!startDate || !endDate) return 0;

  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  // Ensure end date is after start date
  if (end <= start) return 0;

  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return Math.max(1, diffInDays); // Minimal 1 hari
};

// NEW: Calculate duration in hours
export const calculateDurationInHours = (
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): number => {
  if (!startDate || !endDate) return 0;

  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  // Ensure end date is after start date
  if (end <= start) return 0;

  const diffInMs = end.getTime() - start.getTime();
  const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));

  return Math.max(1, diffInHours); // Minimal 1 jam
};

// NEW: Validate date range dengan pesan error yang lebih spesifik
export const validateDateRange = (
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): { isValid: boolean; error?: string; duration?: number } => {
  if (!startDate || !endDate) {
    return {
      isValid: false,
      error: "Tanggal mulai dan tanggal selesai harus diisi",
    };
  }

  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: "Format tanggal tidak valid" };
  }

  if (end <= start) {
    return {
      isValid: false,
      error: "Tanggal selesai harus setelah tanggal mulai",
    };
  }

  const duration = calculateDurationInDays(start, end);

  return {
    isValid: true,
    duration,
  };
};

// NEW: Add days to a date
export const addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const result = new Date(dateObj);
  result.setDate(result.getDate() + days);
  return result;
};

// NEW: Add hours to a date
export const addHoursToDate = (date: Date | string, hours: number): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const result = new Date(dateObj);
  result.setHours(result.getHours() + hours);
  return result;
};

// NEW: Add minutes to a date
export const addMinutesToDate = (
  date: Date | string,
  minutes: number
): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const result = new Date(dateObj);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

// NEW: Get current date/time in various formats
export const getCurrentDateTime = {
  forInput: (): string => formatDateTimeForInput(new Date()),
  forBackend: (): string => formatDateTimeForBackend(new Date()),
  timestamp: (): number => Date.now(),
  iso: (): string => new Date().toISOString(),
};

// NEW: Get minimum return date (1 jam setelah sewa)
export const getMinReturnDate = (startDate: Date | string): string => {
  const dateObj =
    typeof startDate === "string" ? new Date(startDate) : startDate;
  const minReturn = addHoursToDate(dateObj, 1);
  return formatDateTimeForInput(minReturn);
};

// String formatting
export const capitalize = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const truncate = (
  text: string,
  maxLength: number,
  suffix: string = "..."
): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "-";

  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Format Indonesian phone numbers
  if (cleaned.startsWith("62")) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith("0")) {
    return `+62${cleaned.substring(1)}`;
  } else if (cleaned.length > 0) {
    return `+62${cleaned}`;
  } else {
    return "-";
  }
};

export const formatWhatsAppNumber = (
  phone: string | null | undefined
): string => {
  if (!phone) return "";

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("62")) {
    return cleaned;
  } else if (cleaned.startsWith("0")) {
    return `62${cleaned.substring(1)}`;
  } else {
    return `62${cleaned}`;
  }
};

export const formatPlatNomor = (plat: string): string => {
  if (!plat) return "";

  return plat
    .toUpperCase()
    .replace(/([A-Z]{1,2})(\d{1,4})([A-Z]{0,3})/, "$1 $2 $3")
    .trim();
};

// Status formatting
export const formatStatus = (status: string): string => {
  if (!status) return "";

  const statusMap: Record<string, string> = {
    // Motor status
    tersedia: "Tersedia",
    disewa: "Disewa",
    perbaikan: "Perbaikan",
    tidak_tersedia: "Tidak Tersedia",

    // Sewa status
    aktif: "Aktif",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
    pending: "Menunggu",

    // History status
    "Tepat Waktu": "Tepat Waktu",
    Terlambat: "Terlambat",

    // Pembayaran status
    Cash: "Cash",
    Transfer: "Transfer",
    lunas: "Lunas",
    belum_lunas: "Belum Lunas",

    // Penyewa status
    Aman: "Aman",
    Blacklist: "Blacklist",

    // Notifikasi status
    terkirim: "Terkirim",
    gagal: "Gagal",
    menunggu: "Menunggu",
  };

  return statusMap[status] || capitalizeWords(status);
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    // Green colors
    tersedia: "success",
    selesai: "success",
    "Tepat Waktu": "success",
    Aman: "success",
    lunas: "success",
    terkirim: "success",

    // Blue colors
    aktif: "primary",
    pending: "primary",

    // Orange colors
    perbaikan: "warning",
    menunggu: "warning",

    // Red colors
    disewa: "error",
    tidak_tersedia: "error",
    Terlambat: "error",
    Blacklist: "error",
    gagal: "error",
    dibatalkan: "error",
    belum_lunas: "error",
  };

  return colorMap[status] || "default";
};

export const formatJaminan = (jaminan: string | string[] | null): string => {
  if (!jaminan) return "-";

  if (Array.isArray(jaminan)) {
    return jaminan.map((j) => formatStatus(j)).join(", ");
  }

  if (typeof jaminan === "string") {
    return jaminan
      .split(",")
      .map((j) => formatStatus(j.trim()))
      .join(", ");
  }

  return "-";
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Coordinate formatting
export const formatCoordinates = (
  lat: number | null,
  lng: number | null
): string => {
  if (!lat || !lng) return "Tidak tersedia";
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

// API response formatting
export const formatApiError = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "Terjadi kesalahan yang tidak diketahui";
};

// Business specific formatting
export const formatMotorInfo = (motor: {
  merk: string;
  model: string;
  plat_nomor: string;
}): string => {
  if (!motor) return "-";
  return `${motor.merk} ${motor.model} (${motor.plat_nomor})`;
};

export const formatPenyewaInfo = (penyewa: {
  nama: string;
  no_whatsapp: string;
}): string => {
  if (!penyewa) return "-";
  return `${penyewa.nama} (${formatPhoneNumber(penyewa.no_whatsapp)})`;
};

export const formatSewaInfo = (sewa: {
  motor: { merk: string; model: string; plat_nomor: string };
  penyewa: { nama: string };
  tgl_sewa: string;
}): string => {
  if (!sewa) return "-";
  return `${sewa.motor.merk} ${sewa.motor.model} - ${
    sewa.penyewa.nama
  } (${formatDate(sewa.tgl_sewa)})`;
};

// NEW: Calculate rental cost based on duration and rate
export const calculateRentalCost = (
  durationMinutes: number,
  ratePerHour: number,
  ratePerDay: number,
  satuanDurasi: "jam" | "hari" = "hari"
): number => {
  if (durationMinutes <= 0) return 0;

  if (satuanDurasi === "jam") {
    const hours = Math.ceil(durationMinutes / 60);
    return hours * ratePerHour;
  } else {
    const days = Math.ceil(durationMinutes / (60 * 24));
    return days * ratePerDay;
  }
};

// NEW: Format duration for display in rental context
export const formatRentalDuration = (
  minutes: number,
  satuanDurasi: "jam" | "hari" = "hari"
): string => {
  if (minutes <= 0) return "0 " + (satuanDurasi === "jam" ? "jam" : "hari");

  if (satuanDurasi === "jam") {
    const hours = Math.ceil(minutes / 60);
    return `${hours} jam`;
  } else {
    const days = Math.ceil(minutes / (60 * 24));
    return `${days} hari`;
  }
};

// NEW: Calculate penalty/denda
export const calculatePenalty = (
  lateMinutes: number,
  hourlyRate: number
): number => {
  if (lateMinutes <= 0) return 0;

  const lateHours = Math.ceil(lateMinutes / 60);
  return Math.ceil(lateHours * hourlyRate * 0.5); // 50% dari tarif per jam
};

// NEW: Format untuk display harga motor
export const formatMotorPrice = (
  harga: number,
  satuan: "hari" | "jam" = "hari"
): string => {
  if (!harga) return "-";

  const formattedPrice = formatCurrency(harga);
  return `${formattedPrice}/${satuan}`;
};

// NEW: Validasi nomor telepon Indonesia
export const isValidIndonesianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");
  return /^(62|0)8[1-9][0-9]{6,9}$/.test(cleaned);
};

// NEW: Generate display text untuk satuan durasi
export const getDurasiDisplayText = (
  durasi: number,
  satuan: "jam" | "hari"
): string => {
  return `${durasi} ${satuan}`;
};

// NEW: Parse datetime string to Date object dengan validation
export const parseDateTime = (dateString: string): Date | null => {
  if (!dateString) return null;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Export semua formatters
export default {
  // Currency
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatDecimal,
  formatPercentage,

  // Date and time
  formatDate,
  formatDateTime,
  formatTime,
  formatDateLong,
  formatDateForBackend,
  formatDateTimeForBackend,
  formatDateTimeForInput,
  formatRelativeTime,
  formatDuration,

  // Date calculations
  calculateDurationFromInput,
  calculateDurationInDays,
  calculateDurationInHours,
  validateDateRange,
  addDaysToDate,
  addHoursToDate,
  addMinutesToDate,
  getCurrentDateTime,
  getMinReturnDate,
  parseDateTime,

  // String
  capitalize,
  capitalizeWords,
  truncate,
  formatPhoneNumber,
  formatWhatsAppNumber,
  formatPlatNomor,

  // Status
  formatStatus,
  getStatusColor,
  formatJaminan,

  // File
  formatFileSize,

  // Coordinates
  formatCoordinates,

  // API
  formatApiError,

  // Business
  formatMotorInfo,
  formatPenyewaInfo,
  formatSewaInfo,
  calculateRentalCost,
  formatRentalDuration,
  calculatePenalty,
  formatMotorPrice,
  isValidIndonesianPhone,
  getDurasiDisplayText,
};
