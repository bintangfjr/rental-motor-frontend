// src/services/motorService.ts
import api from "./api";
import {
  Motor,
  MotorWithIopgps,
  VehicleStatus,
  MileageHistory,
} from "../types/motor";

// Interface untuk data motor
interface CreateMotorData {
  plat_nomor: string;
  merk: string;
  model: string;
  tahun: number;
  harga: number;
  no_gsm?: string;
  imei?: string;
  status?: "tersedia" | "disewa" | "perbaikan" | "pending_perbaikan";
  service_technician?: string;
  last_service_date?: string;
  service_notes?: string;
}

interface UpdateMotorData {
  plat_nomor?: string;
  merk?: string;
  model?: string;
  tahun?: number;
  harga?: number;
  no_gsm?: string;
  imei?: string;
  status?: "tersedia" | "disewa" | "perbaikan" | "pending_perbaikan";
  service_technician?: string;
  last_service_date?: string;
  service_notes?: string;
}

// Interface khusus untuk setiap response type
interface SyncLocationResponse {
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

interface MotorStatisticsResponse {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  pending_service: number;
  needing_service: number;
}

interface GpsDashboardResponse {
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

// Interface untuk validate IMEI response
interface ValidateImeiResponse {
  valid: boolean;
  message: string;
  imei: string;
}

// Interface untuk GPS status response
interface GpsStatusResponse {
  gps_status: string;
  last_update: string | null;
}

interface RefreshGpsStatusResponse {
  gps_status: string;
  success: boolean;
  message: string;
}

interface RefreshAllGpsStatusResponse {
  success: boolean;
  message: string;
  results: Array<{
    motorId: number;
    plat_nomor: string;
    success: boolean;
    message: string;
    gps_status?: string;
  }>;
}

// Safe error handler dengan type narrowing
class MotorServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "MotorServiceError";
  }
}

const handleServiceError = (operation: string, error: unknown): never => {
  if (error instanceof MotorServiceError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new MotorServiceError(
      `${operation} failed: ${error.message}`,
      "SERVICE_ERROR",
      error
    );
  }

  throw new MotorServiceError(
    `${operation} failed: Unknown error occurred`,
    "UNKNOWN_ERROR",
    error
  );
};

// Flexible API response handler yang menerima berbagai format response
const handleApiResponse = <T>(
  operation: string,
  response: unknown,
  expectedDataField: string = "data"
): T => {
  // Handle null or undefined response
  if (response === null || response === undefined) {
    throw new MotorServiceError(
      `Empty response for ${operation}`,
      "EMPTY_RESPONSE"
    );
  }

  // Case 1: Response adalah array langsung (tanpa wrapper)
  if (Array.isArray(response)) {
    return response as T;
  }

  // Case 2: Response sudah dalam format object dengan success field
  if (
    typeof response === "object" &&
    response !== null &&
    "success" in response
  ) {
    const apiResponse = response as {
      success: boolean;
      data?: unknown;
      message?: string;
    };

    if (!apiResponse.success) {
      throw new MotorServiceError(
        apiResponse.message || `${operation} failed`,
        "API_ERROR"
      );
    }

    // ✅ PERBAIKAN: Untuk delete operation, kita tidak mengharapkan data
    if (operation === "Delete motor") {
      return undefined as T;
    }

    // Jika ada data, return data
    if (apiResponse.data !== undefined) {
      return apiResponse.data as T;
    }

    // Jika tidak ada data tetapi success, return empty array untuk array types
    if (Array.isArray(response)) {
      return [] as unknown as T;
    }

    throw new MotorServiceError(`No data returned for ${operation}`, "NO_DATA");
  }

  // Case 3: Response memiliki field data yang diharapkan
  if (
    typeof response === "object" &&
    response !== null &&
    expectedDataField in response
  ) {
    const dataResponse = response as Record<string, unknown>;
    return dataResponse[expectedDataField] as T;
  }

  // Case 4: Response adalah object langsung (asumsi success)
  if (typeof response === "object" && response !== null) {
    return response as T;
  }

  // Case 5: Response adalah primitive value
  if (
    typeof response === "string" ||
    typeof response === "number" ||
    typeof response === "boolean"
  ) {
    return response as T;
  }

  throw new MotorServiceError(
    `Invalid API response structure for ${operation}. Received: ${typeof response}`,
    "INVALID_RESPONSE"
  );
};

const safeApiCall = async <T>(
  operation: string,
  apiCall: () => Promise<unknown>,
  expectedDataField: string = "data"
): Promise<T> => {
  try {
    const response = await apiCall();
    return handleApiResponse<T>(operation, response, expectedDataField);
  } catch (error) {
    if (error instanceof MotorServiceError) {
      throw error;
    }
    return handleServiceError(operation, error);
  }
};

// Type untuk axios error response
interface AxiosErrorResponse {
  response?: {
    data?: unknown;
    status?: number;
  };
  message?: string;
}

const isAxiosError = (error: unknown): error is AxiosErrorResponse => {
  return typeof error === "object" && error !== null && "response" in error;
};

export const motorService = {
  // ==================== BASIC CRUD OPERATIONS ====================

  async getAll(): Promise<Motor[]> {
    return safeApiCall<Motor[]>("Get all motors", async () => {
      const response = await api.get("/motors");
      return response.data;
    });
  },

  async getWithGps(): Promise<MotorWithIopgps[]> {
    return safeApiCall<MotorWithIopgps[]>("Get motors with GPS", async () => {
      const response = await api.get("/motors/gps/all");
      return response.data;
    });
  },

  async getById(id: number): Promise<MotorWithIopgps> {
    return safeApiCall<MotorWithIopgps>("Get motor by ID", async () => {
      const response = await api.get(`/motors/${id}`);
      return response.data;
    });
  },

  async create(data: CreateMotorData): Promise<Motor> {
    return safeApiCall<Motor>("Create motor", async () => {
      const response = await api.post("/motors", data);
      return response.data;
    });
  },

  async update(id: number, data: UpdateMotorData): Promise<Motor> {
    return safeApiCall<Motor>("Update motor", async () => {
      const response = await api.put(`/motors/${id}`, data);
      return response.data;
    });
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await api.delete(`/motors/${id}`);

      // Handle response untuk delete operation
      if (response.data && typeof response.data === "object") {
        const responseData = response.data as {
          success?: boolean;
          message?: string;
          data?: unknown;
        };

        // Jika success, return void
        if (responseData.success === true) {
          return;
        }

        // Jika tidak success, throw error
        if (responseData.success === false) {
          throw new MotorServiceError(
            responseData.message || "Failed to delete motor",
            "DELETE_ERROR"
          );
        }
      }

      // Jika response tidak sesuai format, anggap success
      return;
    } catch (error: unknown) {
      if (error instanceof MotorServiceError) {
        throw error;
      }

      // Handle axios error
      if (isAxiosError(error)) {
        const errorData = error.response?.data;
        if (
          errorData &&
          typeof errorData === "object" &&
          "message" in errorData
        ) {
          throw new MotorServiceError(
            String(errorData.message),
            "DELETE_ERROR",
            error
          );
        }
      }

      throw new MotorServiceError(
        error instanceof Error ? error.message : "Failed to delete motor",
        "DELETE_ERROR",
        error
      );
    }
  },

  // ==================== SERVICE MANAGEMENT ====================

  async markForService(motorId: number, serviceNotes?: string): Promise<Motor> {
    return safeApiCall<Motor>("Mark motor for service", async () => {
      const response = await api.put(`/motors/${motorId}/mark-for-service`, {
        service_notes: serviceNotes,
      });
      return response.data;
    });
  },

  async completeService(motorId: number): Promise<Motor> {
    return safeApiCall<Motor>("Complete service", async () => {
      const response = await api.put(`/motors/${motorId}/complete-service`);
      return response.data;
    });
  },

  async startService(motorId: number, technician: string): Promise<Motor> {
    try {
      return await safeApiCall<Motor>("Start service", async () => {
        const response = await api.put(`/motors/${motorId}/start-service`, {
          technician,
        });
        return response.data;
      });
    } catch (error) {
      // Safe fallback
      if (error instanceof MotorServiceError && error.code === "API_ERROR") {
        return this.markForService(motorId, `Technician: ${technician}`);
      }
      throw error;
    }
  },

  async cancelService(motorId: number): Promise<Motor> {
    return safeApiCall<Motor>("Cancel service", async () => {
      const response = await api.put(`/motors/${motorId}/cancel-service`);
      return response.data;
    });
  },

  async updateServiceInfo(
    motorId: number,
    data: {
      service_technician?: string;
      last_service_date?: string;
      service_notes?: string;
    }
  ): Promise<Motor> {
    try {
      return await safeApiCall<Motor>("Update service info", async () => {
        const response = await api.put(`/motors/${motorId}/service-info`, data);
        return response.data;
      });
    } catch (error) {
      // Safe fallback
      if (error instanceof MotorServiceError) {
        return this.update(motorId, data);
      }
      throw error;
    }
  },

  // ==================== QUERY METHODS ====================

  async findPendingService(): Promise<Motor[]> {
    return safeApiCall<Motor[]>("Find pending service motors", async () => {
      const response = await api.get("/motors/service/pending");
      return response.data;
    });
  },

  async findInService(): Promise<Motor[]> {
    return safeApiCall<Motor[]>("Find in-service motors", async () => {
      const response = await api.get("/motors/service/in-progress");
      return response.data;
    });
  },

  async findCompletedService(): Promise<Motor[]> {
    try {
      return await safeApiCall<Motor[]>(
        "Find completed service motors",
        async () => {
          const response = await api.get("/motors/service/completed");
          return response.data;
        }
      );
    } catch (error) {
      // Safe fallback
      if (error instanceof MotorServiceError) {
        const allMotors = await this.getAll();
        return allMotors.filter(
          (motor) =>
            motor.status === "tersedia" &&
            motor.service_notes?.includes("completed")
        );
      }
      throw error;
    }
  },

  async findByStatus(status: string): Promise<Motor[]> {
    try {
      return await safeApiCall<Motor[]>("Find motors by status", async () => {
        const response = await api.get(`/motors/status/${status}`);
        return response.data;
      });
    } catch (error) {
      // Safe fallback
      if (error instanceof MotorServiceError) {
        const allMotors = await this.getAll();
        return allMotors.filter((motor) => motor.status === status);
      }
      throw error;
    }
  },

  async findMotorsNeedingService(mileageThreshold?: number): Promise<Motor[]> {
    try {
      return await safeApiCall<Motor[]>(
        "Find motors needing service",
        async () => {
          const params = mileageThreshold ? { mileageThreshold } : {};
          const response = await api.get("/motors/needing-service", { params });
          return response.data;
        }
      );
    } catch (error) {
      // Safe fallback - return empty array
      if (error instanceof MotorServiceError) {
        return [];
      }
      throw error;
    }
  },

  // ==================== SEARCH & STATISTICS ====================

  async searchByPlateNumber(plate: string): Promise<Motor[]> {
    try {
      return await safeApiCall<Motor[]>("Search motors by plate", async () => {
        const response = await api.get("/motors/search", {
          params: { plate },
        });
        return response.data;
      });
    } catch (error) {
      // Safe fallback
      if (error instanceof MotorServiceError) {
        const allMotors = await this.getAll();
        return allMotors.filter((motor) =>
          motor.plat_nomor.toLowerCase().includes(plate.toLowerCase())
        );
      }
      throw error;
    }
  },

  async getMotorStatistics(): Promise<MotorStatisticsResponse> {
    try {
      return await safeApiCall<MotorStatisticsResponse>(
        "Get motor statistics",
        async () => {
          const response = await api.get("/motors/statistics");
          return response.data;
        }
      );
    } catch (error) {
      // Safe fallback
      if (error instanceof MotorServiceError) {
        const allMotors = await this.getAll();
        return {
          total: allMotors.length,
          available: allMotors.filter((m) => m.status === "tersedia").length,
          rented: allMotors.filter((m) => m.status === "disewa").length,
          maintenance: allMotors.filter((m) => m.status === "perbaikan").length,
          pending_service: allMotors.filter(
            (m) => m.status === "pending_perbaikan"
          ).length,
          needing_service: allMotors.filter(
            (m) => m.status === "perbaikan" || m.status === "pending_perbaikan"
          ).length,
        };
      }
      throw error;
    }
  },

  // ==================== GPS & MILEAGE OPERATIONS ====================

  async syncLocation(motorId: number): Promise<SyncLocationResponse> {
    return safeApiCall<SyncLocationResponse>("Sync location", async () => {
      const response = await api.post(`/motors/${motorId}/sync-location`);
      return response.data;
    });
  },

  async syncMileage(
    motorId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/motors/${motorId}/sync-mileage`);

      // Handle berbagai format response untuk sync mileage
      if (response.data && typeof response.data === "object") {
        const responseData = response.data as {
          success?: boolean;
          data?: { success?: boolean; message?: string };
          message?: string;
        };

        // Case 1: Response memiliki data field
        if (responseData.data && typeof responseData.data === "object") {
          return {
            success: responseData.data.success === true,
            message: responseData.data.message || "Mileage synced successfully",
          };
        }

        // Case 2: Response langsung
        if (responseData.success !== undefined) {
          return {
            success: responseData.success === true,
            message: responseData.message || "Mileage synced successfully",
          };
        }
      }

      // Default success
      return {
        success: true,
        message: "Mileage synced successfully",
      };
    } catch (error: any) {
      console.error("Sync mileage error:", error);

      // Handle error response
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          return {
            success: false,
            message: errorData.message,
          };
        }
      }

      return {
        success: false,
        message: error.message || "Failed to sync mileage",
      };
    }
  },

  async getVehicleStatus(motorId: number): Promise<VehicleStatus> {
    return safeApiCall<VehicleStatus>("Get vehicle status", async () => {
      const response = await api.get(`/motors/${motorId}/vehicle-status`);
      return response.data;
    });
  },

  async getMileageHistory(
    motorId: number,
    days: number = 30
  ): Promise<MileageHistory[]> {
    return safeApiCall<MileageHistory[]>("Get mileage history", async () => {
      const response = await api.get(
        `/motors/${motorId}/mileage-history?days=${days}`
      );
      return response.data;
    });
  },

  // ==================== GPS DASHBOARD ====================

  async getGpsDashboard(): Promise<GpsDashboardResponse> {
    return safeApiCall<GpsDashboardResponse>("Get GPS dashboard", async () => {
      const response = await api.get("/motors/dashboard/gps");
      return response.data;
    });
  },

  // ==================== GPS STATUS MANAGEMENT ====================

  async getAccurateGpsStatus(motorId: number): Promise<GpsStatusResponse> {
    return safeApiCall<GpsStatusResponse>(
      "Get accurate GPS status",
      async () => {
        try {
          const response = await api.get(`/motors/${motorId}/gps-status`);
          return response.data;
        } catch (error) {
          // Fallback jika endpoint belum tersedia di backend
          const motor = await this.getById(motorId);
          return {
            gps_status: motor.gps_status || "NoImei",
            last_update: motor.last_update || null,
          };
        }
      }
    );
  },

  async refreshGpsStatus(motorId: number): Promise<RefreshGpsStatusResponse> {
    return safeApiCall<RefreshGpsStatusResponse>(
      "Refresh GPS status",
      async () => {
        try {
          const response = await api.post(
            `/motors/${motorId}/refresh-gps-status`
          );
          return response.data;
        } catch (error) {
          // Fallback jika endpoint belum tersedia
          console.warn(
            "Refresh GPS status endpoint not available, using sync location as fallback"
          );

          try {
            const syncResult = await this.syncLocation(motorId);
            const motor = await this.getById(motorId);

            return {
              gps_status: motor.gps_status || "Offline",
              success: syncResult.success,
              message: syncResult.message,
            };
          } catch (syncError) {
            return {
              gps_status: "Error",
              success: false,
              message: "Failed to refresh GPS status",
            };
          }
        }
      }
    );
  },

  async refreshAllGpsStatus(): Promise<RefreshAllGpsStatusResponse> {
    return safeApiCall<RefreshAllGpsStatusResponse>(
      "Refresh all GPS status",
      async () => {
        try {
          const response = await api.post("/motors/refresh-all-gps-status");
          return response.data;
        } catch (error) {
          // Fallback jika endpoint belum tersedia
          console.warn(
            "Refresh all GPS status endpoint not available, using individual sync as fallback"
          );

          const allMotors = await this.getAll();
          const motorsWithImei = allMotors.filter((motor) => motor.imei);

          const results = [];

          for (const motor of motorsWithImei) {
            try {
              const syncResult = await this.syncLocation(motor.id);
              const updatedMotor = await this.getById(motor.id);

              results.push({
                motorId: motor.id,
                plat_nomor: motor.plat_nomor,
                success: syncResult.success,
                message: syncResult.message,
                gps_status: updatedMotor.gps_status,
              });
            } catch (syncError) {
              results.push({
                motorId: motor.id,
                plat_nomor: motor.plat_nomor,
                success: false,
                message: "Sync failed",
              });
            }
          }

          return {
            success: true,
            message: `GPS status refreshed for ${results.length} motors`,
            results,
          };
        }
      }
    );
  },

  // ==================== IMEI VALIDATION ====================

  async validateImei(imei: string): Promise<ValidateImeiResponse> {
    try {
      const response = await api.get("/motors/validate-imei", {
        params: { imei },
      });

      // Handle berbagai format response
      const responseData = response.data;

      if (responseData && typeof responseData === "object") {
        // Case 1: Format dengan data field
        if ("data" in responseData && responseData.data) {
          return responseData.data as ValidateImeiResponse;
        }

        // Case 2: Format langsung ValidateImeiResponse
        if ("valid" in responseData && "message" in responseData) {
          return responseData as ValidateImeiResponse;
        }

        // Case 3: Format success dengan data
        if (responseData.success && responseData.data) {
          return responseData.data as ValidateImeiResponse;
        }
      }

      return {
        valid: false,
        message: "Invalid IMEI format",
        imei: imei,
      };
    } catch (error: unknown) {
      console.error("IMEI validation error:", error);

      // Type-safe error extraction
      let errorMessage = "Failed to validate IMEI";
      if (
        isAxiosError(error) &&
        error.response?.data &&
        typeof error.response.data === "object"
      ) {
        const errorData = error.response.data as Record<string, unknown>;
        errorMessage = String(
          errorData.error || errorData.message || errorMessage
        );
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        valid: false,
        message: errorMessage,
        imei: imei,
      };
    }
  },

  // Check IMEI in IOPGPS system
  async checkImeiInIopgps(imei: string): Promise<ValidateImeiResponse> {
    try {
      const response = await api.get("/motors/check-imei-iopgps", {
        params: { imei },
      });

      const responseData = response.data;

      if (responseData && typeof responseData === "object") {
        if ("data" in responseData && responseData.data) {
          return responseData.data as ValidateImeiResponse;
        }

        if ("valid" in responseData && "message" in responseData) {
          return responseData as ValidateImeiResponse;
        }

        if (responseData.success && responseData.data) {
          return responseData.data as ValidateImeiResponse;
        }
      }

      return {
        valid: false,
        message: "IMEI not registered in IOPGPS",
        imei: imei,
      };
    } catch (error: unknown) {
      console.error("IOPGPS IMEI check error:", error);

      let errorMessage = "Failed to check IMEI in IOPGPS system";
      if (
        isAxiosError(error) &&
        error.response?.data &&
        typeof error.response.data === "object"
      ) {
        const errorData = error.response.data as Record<string, unknown>;
        errorMessage = String(
          errorData.error || errorData.message || errorMessage
        );
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        valid: false,
        message: errorMessage,
        imei: imei,
      };
    }
  },

  // Comprehensive IMEI validation
  async comprehensiveImeiValidation(imei: string): Promise<{
    formatValid: boolean;
    iopgpsRegistered: boolean;
    message: string;
  }> {
    try {
      // Step 1: Basic format validation
      const formatValidation = await this.validateImei(imei);

      if (!formatValidation.valid) {
        return {
          formatValid: false,
          iopgpsRegistered: false,
          message: formatValidation.message,
        };
      }

      // Step 2: Check in IOPGPS system
      const iopgpsCheck = await this.checkImeiInIopgps(imei);

      return {
        formatValid: true,
        iopgpsRegistered: iopgpsCheck.valid,
        message: iopgpsCheck.valid
          ? "IMEI valid dan terdaftar di sistem IOPGPS"
          : "IMEI format valid tetapi tidak terdaftar di sistem IOPGPS",
      };
    } catch (error: unknown) {
      return {
        formatValid: false,
        iopgpsRegistered: false,
        message:
          error instanceof Error ? error.message : "Gagal memvalidasi IMEI",
      };
    }
  },

  // ==================== UTILITY METHODS ====================

  async updateMotorStatus(
    id: number,
    status: "tersedia" | "disewa" | "perbaikan" | "pending_perbaikan"
  ): Promise<Motor> {
    return this.update(id, { status });
  },

  async resetMotorServiceData(id: number): Promise<Motor> {
    return this.update(id, {
      service_technician: undefined,
      service_notes: undefined,
      status: "tersedia" as const,
    });
  },

  // Enhanced method untuk mendapatkan motors dengan status GPS yang akurat
  async getAllWithAccurateGps(): Promise<Motor[]> {
    try {
      const motors = await this.getAll();

      // Untuk setiap motor, dapatkan status GPS yang akurat
      const motorsWithAccurateStatus = await Promise.all(
        motors.map(async (motor) => {
          try {
            const accurateStatus = await this.getAccurateGpsStatus(motor.id);
            return {
              ...motor,
              gps_status: accurateStatus.gps_status,
              last_update: accurateStatus.last_update || motor.last_update,
            };
          } catch (error) {
            console.warn(
              `Failed to get accurate GPS status for motor ${motor.id}:`,
              error
            );
            return motor; // Fallback ke status dari getAll
          }
        })
      );

      return motorsWithAccurateStatus;
    } catch (error) {
      console.error("Error getting motors with accurate GPS:", error);
      return this.getAll(); // Fallback ke method biasa
    }
  },
};

// Export error class untuk handling di consumer
export { MotorServiceError };
