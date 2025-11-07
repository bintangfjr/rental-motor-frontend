import api from "./api";
import {
  DashboardStats,
  MonthlyReport,
  MotorUsage,
  FinancialReport,
} from "../types/report";

export const reportService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get("/reports/dashboard");
    return response.data.data;
  },

  // Get monthly reports
  async getMonthlyReports(
    year?: number,
    month?: number,
  ): Promise<MonthlyReport> {
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());
    if (month) params.append("month", month.toString());

    const response = await api.get(`/reports/monthly?${params}`);
    return response.data.data;
  },

  // Get motor usage statistics
  async getMotorUsage(
    startDate?: string,
    endDate?: string,
  ): Promise<MotorUsage[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/motor-usage?${params}`);
    return response.data.data;
  },

  // Get financial reports
  async getFinancialReports(
    startDate?: string,
    endDate?: string,
  ): Promise<FinancialReport> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/financial?${params}`);
    return response.data.data;
  },
};
