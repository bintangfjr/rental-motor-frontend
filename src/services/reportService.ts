import api from "./api";
import {
  DashboardStats,
  MonthlyReport,
  MotorUsage,
  FinancialReport,
  BackupReport,
  ExportBackupData,
  HistoryRecord,
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
    month?: number
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
    endDate?: string
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
    endDate?: string
  ): Promise<FinancialReport> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/financial?${params}`);
    return response.data.data;
  },

  // ✅ NEW: Get backup data from histories
  async getBackupReport(
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<BackupReport> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await api.get(`/reports/backup?${params}`);
    return response.data.data;
  },

  // ✅ NEW: Export backup data for CSV/Excel
  async exportBackupData(
    startDate?: string,
    endDate?: string
  ): Promise<ExportBackupData> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/backup/export?${params}`);
    return response.data.data;
  },

  // ✅ NEW: Download backup as CSV file
  async downloadBackupCSV(startDate?: string, endDate?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/backup/export?${params}`, {
      responseType: "blob",
      headers: {
        Accept: "text/csv, application/json",
      },
    });

    return response.data;
  },

  // ✅ NEW: Get single history record
  async getHistoryRecord(id: number): Promise<HistoryRecord> {
    const response = await api.get(`/histories/${id}`);
    return response.data.data;
  },

  // ✅ NEW: Search histories
  async searchHistories(
    search: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: HistoryRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    params.append("search", search);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await api.get(`/histories?${params}`);
    return response.data.data;
  },
};

// ✅ NEW: Utility function untuk download CSV
export const downloadCSV = (data: any[], filename: string) => {
  if (!data.length) return;

  // Create CSV headers
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(",");

  // Create CSV rows
  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",")
  );

  // Combine headers and rows
  const csvContent = [csvHeaders, ...csvRows].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ✅ NEW: Utility function untuk format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// ✅ NEW: Utility function untuk format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ✅ NEW: Utility function untuk format datetime
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
