// src/types/motor.ts

export interface Motor {
  id: number;
  plat_nomor: string;
  merk: string;
  model: string;
  tahun: number;
  harga: number;
  no_gsm?: string;
  imei?: string;
  status: "tersedia" | "disewa" | "perbaikan" | "pending_perbaikan";
  device_id?: string;
  lat?: number;
  lng?: number;
  last_update?: string;

  // ✅ GPS & MILEAGE FIELDS
  gps_status: "Online" | "Offline" | "NoImei" | "Error";
  total_mileage?: number;
  last_known_address?: string;
  last_mileage_sync?: string;

  // ✅ SERVICE FIELDS
  service_technician?: string;
  last_service_date?: string;
  service_notes?: string;

  created_at: string;
  updated_at: string;
}

export interface MotorWithIopgps extends Motor {
  iopgps_data?: {
    location?: {
      lat: number;
      lng: number;
      address: string;
      speed: number;
      direction: number;
      gps_time: string;
    };
    status?: string;
    online?: boolean;
    last_update?: string;
  };
  mileage_history?: MileageHistory[];
  location_cache?: LocationCache[];
  service_records?: ServiceRecord[];
  sewas?: Array<{
    id: number;
    penyewa: {
      id: number;
      nama: string;
      no_whatsapp: string;
    };
  }>;
}

export interface MileageHistory {
  id: number;
  motor_id: number;
  imei: string;
  start_time: string;
  end_time: string;
  distance_km: number;
  run_time_seconds: number;
  average_speed_kmh: number;
  period_date: string;
  created_at: string;
  updated_at: string;
}

export interface LocationCache {
  id: number;
  motor_id: number;
  imei: string;
  lat: number;
  lng: number;
  address?: string;
  speed?: number;
  direction?: number;
  gps_time: string;
  location_type: string;
  created_at: string;
}

// ✅ SERVICE RECORD INTERFACE - DIPERBAIKI SESUAI BACKEND
export interface ServiceRecord {
  id: number;
  motor_id: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  service_type: "rutin" | "berat" | "perbaikan" | "emergency";
  service_date: string;
  estimated_completion?: string;
  actual_completion?: string;
  service_location: string;
  service_technician: string;
  parts?: string[];
  services?: string[];
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
  service_notes?: string; // ✅ DIPERBAIKI: service_notes bukan service_summary
  mileage_at_service?: number;
  created_at: string;
  updated_at: string;
  motor?: {
    id: number;
    plat_nomor: string;
    merk: string;
    model: string;
    status: string;
  };
}

export interface VehicleStatus {
  imei: string;
  licenseNumber: string;
  lat: number;
  lng: number;
  speed: number;
  direction: number;
  gpsTime: number;
  location: string;
  status: string;
  acc?: string; // ✅ DIPERBAIKI: optional
  online?: string; // ✅ DIPERBAIKI: optional
}

// ✅ SERVICE STATISTICS INTERFACE - SESUAIKAN DENGAN BACKEND
export interface ServiceStatistics {
  total: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalCost: number;
}

// ✅ INTERFACE UNTUK START SERVICE - SESUAIKAN DENGAN BACKEND
export interface StartServiceData {
  service_type: "rutin" | "berat" | "perbaikan" | "emergency";
  service_location: string;
  service_technician: string;
  parts?: string[];
  services?: string[];
  estimated_cost?: number;
  estimated_completion?: string;
  notes?: string;
  service_notes?: string;
}

// ✅ INTERFACE UNTUK COMPLETE SERVICE - SESUAIKAN DENGAN BACKEND
export interface CompleteServiceData {
  actual_cost?: number; // ✅ DIPERBAIKI: optional
  actual_completion?: string;
  notes?: string;
  service_summary?: string;
}

// ✅ INTERFACE UNTUK CREATE SERVICE RECORD
export interface CreateServiceRecordData {
  motor_id: number;
  service_type: "rutin" | "berat" | "perbaikan" | "emergency";
  service_date: string;
  service_location: string;
  service_technician: string;
  parts?: string[];
  services?: string[];
  estimated_cost?: number;
  estimated_completion?: string;
  notes?: string;
  service_notes?: string; // ✅ DITAMBAHKAN
}

// ✅ INTERFACE UNTUK UPDATE SERVICE RECORD
export interface UpdateServiceRecordData {
  service_type?: "rutin" | "berat" | "perbaikan" | "emergency";
  service_date?: string;
  service_location?: string;
  service_technician?: string;
  parts?: string[];
  services?: string[];
  estimated_cost?: number;
  estimated_completion?: string;
  notes?: string;
  service_notes?: string; // ✅ DITAMBAHKAN
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  service_summary?: string;
  actual_cost?: number;
  actual_completion?: string;
}

// ✅ INTERFACE UNTUK SERVICE RESPONSE
export interface ServiceResponse {
  serviceRecord: ServiceRecord;
  motor: Motor;
}

// ✅ INTERFACE UNTUK MOTOR STATISTICS - BARU DITAMBAHKAN
export interface MotorStatistics {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  pending_service: number;
  needing_service: number;
}

// ✅ INTERFACE UNTUK GPS DASHBOARD - BARU DITAMBAHKAN
export interface GpsDashboardData {
  summary: {
    total: number;
    online: number;
    offline: number;
    no_imei: number;
    moving: number;
    parked: number;
    lastUpdated: string;
  };
  recentUpdates: MotorWithIopgps[];
}

// ✅ INTERFACE UNTUK SYNC LOCATION RESPONSE - BARU DITAMBAHKAN
export interface SyncLocationResponse {
  success: boolean;
  data: {
    id: number;
    plat_nomor: string;
    lat: number | null;
    lng: number | null;
    last_update: string | null;
  };
  message: string;
}

// ✅ INTERFACE UNTUK TRACK HISTORY - BARU DITAMBAHKAN
export interface TrackHistoryResponse {
  imei: string;
  period: {
    start: string;
    end: string;
  };
  points: Array<{
    lat: number;
    lng: number;
    speed: number;
    direction: number;
    gpsTime: number;
    address?: string;
  }>;
  summary: {
    totalDistance: number;
    totalDuration: number;
    averageSpeed: number;
    maxSpeed: number;
    stops: number;
  };
}

// ✅ INTERFACE UNTUK MILEAGE DATA - BARU DITAMBAHKAN
export interface MileageData {
  imei: string;
  startTime: number;
  endTime: number;
  runTime: number;
  distance: number;
  averageSpeed: number;
  period: {
    start: string;
    end: string;
  };
}

// ✅ ENUM UNTUK SERVICE STATUS
export enum ServiceStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// ✅ ENUM UNTUK SERVICE TYPE
export enum ServiceType {
  RUTIN = "rutin",
  BERAT = "berat",
  PERBAIKAN = "perbaikan",
  EMERGENCY = "emergency",
}

// ✅ ENUM UNTUK MOTOR STATUS - BARU DITAMBAHKAN
export enum MotorStatus {
  TERSEDIA = "tersedia",
  DISEWA = "disewa",
  PERBAIKAN = "perbaikan",
  PENDING_PERBAIKAN = "pending_perbaikan",
}

// ✅ ENUM UNTUK GPS STATUS - BARU DITAMBAHKAN
export enum GpsStatus {
  ONLINE = "Online",
  OFFLINE = "Offline",
  NO_IMEI = "NoImei",
  ERROR = "Error",
}

// ✅ INTERFACE UNTUK SERVICE FILTER
export interface ServiceFilter {
  status?: ServiceStatus | "";
  service_type?: ServiceType | "";
  start_date?: string;
  end_date?: string;
  technician?: string;
}

// ✅ INTERFACE UNTUK PAGINATED SERVICE RECORDS
export interface PaginatedServiceRecords {
  data: ServiceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ✅ INTERFACE UNTUK PAGINATED MOTORS - BARU DITAMBAHKAN
export interface PaginatedMotors {
  data: Motor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ✅ INTERFACE UNTUK API RESPONSE - BARU DITAMBAHKAN
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}

// ✅ INTERFACE UNTUK CREATE MOTOR DATA - BARU DITAMBAHKAN
export interface CreateMotorData {
  plat_nomor: string;
  merk: string;
  model: string;
  tahun: number;
  harga: number;
  no_gsm?: string;
  imei?: string;
  status?: MotorStatus;
  service_technician?: string;
  last_service_date?: string;
  service_notes?: string;
}

// ✅ INTERFACE UNTUK UPDATE MOTOR DATA - BARU DITAMBAHKAN
export interface UpdateMotorData {
  plat_nomor?: string;
  merk?: string;
  model?: string;
  tahun?: number;
  harga?: number;
  no_gsm?: string;
  imei?: string;
  status?: MotorStatus;
  service_technician?: string;
  last_service_date?: string;
  service_notes?: string;
  lat?: number;
  lng?: number;
  total_mileage?: number;
}
