import api from "./api";
import { ServiceRecord, ServiceStatistics, Motor } from "../types/motor";

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

export interface CompleteServiceData {
  actual_cost: number;
  actual_completion?: string;
  notes?: string;
  service_summary?: string;
}

export const motorServiceService = {
  // Get all service records
  async getAllServiceRecords(): Promise<ServiceRecord[]> {
    const response = await api.get("/motor-service");
    return response.data;
  },

  // Get service records by motor ID
  async getServiceRecordsByMotorId(motorId: number): Promise<ServiceRecord[]> {
    const response = await api.get(`/motor-service/motor/${motorId}`);
    return response.data;
  },

  // Get active service record for motor
  async getActiveServiceRecord(motorId: number): Promise<ServiceRecord | null> {
    const response = await api.get(`/motor-service/active/${motorId}`);
    return response.data;
  },

  // Start service for a motor
  async startService(
    motorId: number,
    serviceData: StartServiceData
  ): Promise<{
    serviceRecord: ServiceRecord;
    motor: Motor;
  }> {
    const response = await api.post(
      `/motor-service/start/${motorId}`,
      serviceData
    );
    return response.data;
  },

  // Complete service
  async completeService(
    serviceRecordId: number,
    completeData: CompleteServiceData
  ): Promise<{
    serviceRecord: ServiceRecord;
    motor: Motor;
  }> {
    const response = await api.put(
      `/motor-service/complete/${serviceRecordId}`,
      completeData
    );
    return response.data;
  },

  // Cancel service
  async cancelService(serviceRecordId: number): Promise<ServiceRecord> {
    const response = await api.put(`/motor-service/cancel/${serviceRecordId}`);
    return response.data;
  },

  // Update service record
  async updateServiceRecord(
    id: number,
    data: Partial<ServiceRecord>
  ): Promise<ServiceRecord> {
    const response = await api.put(`/motor-service/${id}`, data);
    return response.data;
  },

  // Delete service record
  async deleteServiceRecord(id: number): Promise<void> {
    await api.delete(`/motor-service/${id}`);
  },

  // Get service statistics
  async getServiceStats(): Promise<ServiceStatistics> {
    const response = await api.get("/motor-service/stats");
    return response.data;
  },

  // Get pending service motors
  async getPendingServiceMotors(): Promise<Motor[]> {
    const response = await api.get("/motor-service/pending");
    return response.data;
  },

  // Get motors in service
  async getMotorsInService(): Promise<Motor[]> {
    const response = await api.get("/motor-service/in-service");
    return response.data;
  },

  // Create service record
  async createServiceRecord(data: {
    motor_id: number;
    service_type: "rutin" | "berat" | "perbaikan" | "emergency";
    service_date: string;
    service_location: string;
    service_technician: string;
    parts?: string[];
    services?: string[];
    estimated_cost?: number;
    notes?: string;
  }): Promise<ServiceRecord> {
    const response = await api.post("/motor-service", data);
    return response.data;
  },
};
