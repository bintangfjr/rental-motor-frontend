// pages/MonthlyReport.tsx
import React, { useState, useEffect, useRef } from "react";
import { reportService } from "../../services/reportService";
import { MonthlyReport } from "../../types/report";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency } from "../../utils/formatters";
import { useTheme } from "../../hooks/useTheme";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

const MonthlyReportPage: React.FC = () => {
  const { isDark } = useTheme();
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMonthlyReport();
  }, []);

  const loadMonthlyReport = async () => {
    try {
      setIsLoading(true);
      const report = await reportService.getMonthlyReports(
        filters.year,
        filters.month
      );
      setMonthlyReport(report);
    } catch (err) {
      console.error("Error loading monthly report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const downloadAsPNG = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `laporan-bulanan-${filters.month}-${filters.year}-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
      alert("Gagal mengunduh gambar. Silakan coba lagi.");
    }
  };

  const downloadAsExcel = () => {
    try {
      let data: any[] = [];

      if (monthlyReport) {
        data = [
          ["Laporan Bulanan", monthlyReport.periode || "-"],
          ["Total Sewa", monthlyReport.totalSewa || 0],
          ["Total Pendapatan", monthlyReport.totalPendapatan || 0],
          [],
          ["Motor Terpopuler"],
          ["Motor", "Jumlah Sewa"],
          ...(monthlyReport.motorTerpopuler || []).map((item) => [
            `${item.motor_merk} ${item.motor_model}`,
            item.total_sewa,
          ]),
          [],
          ["Penyewa Teraktif"],
          ["Penyewa", "WhatsApp", "Jumlah Sewa"],
          ...(monthlyReport.penyewaTeraktif || []).map((item) => [
            item.penyewa_nama,
            item.penyewa_whatsapp,
            item.total_sewa,
          ]),
        ];
      }

      if (data.length === 0) {
        alert("Tidak ada data untuk diunduh.");
        return;
      }

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Bulanan");
      XLSX.writeFile(
        wb,
        `laporan-bulanan-${filters.month}-${filters.year}-${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Gagal mengunduh Excel. Silakan coba lagi.");
    }
  };

  const StatsCard: React.FC<{
    title: string;
    value: string | number;
    color: "blue" | "green" | "purple" | "orange" | "red";
    icon?: string;
  }> = ({ title, value, color, icon }) => {
    const colorClasses = {
      blue: {
        light: "bg-blue-50 text-blue-800 border-blue-200",
        dark: "bg-blue-900/20 text-blue-300 border-blue-800",
      },
      green: {
        light: "bg-green-50 text-green-800 border-green-200",
        dark: "bg-green-900/20 text-green-300 border-green-800",
      },
      purple: {
        light: "bg-purple-50 text-purple-800 border-purple-200",
        dark: "bg-purple-900/20 text-purple-300 border-purple-800",
      },
      orange: {
        light: "bg-orange-50 text-orange-800 border-orange-200",
        dark: "bg-orange-900/20 text-orange-300 border-orange-800",
      },
      red: {
        light: "bg-red-50 text-red-800 border-red-200",
        dark: "bg-red-900/20 text-red-300 border-red-800",
      },
    };

    const currentColor = isDark
      ? colorClasses[color].dark
      : colorClasses[color].light;

    return (
      <Card className={`border-2 ${currentColor} p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {icon && <div className="text-2xl opacity-70">{icon}</div>}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          Laporan Bulanan
        </h1>

        {/* Hanya tampilkan navigasi ke dashboard */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/reports")}
            size="sm"
          >
            📊 Dashboard
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="number"
              label="Tahun"
              value={filters.year}
              onChange={(e) =>
                handleFilterChange("year", parseInt(e.target.value))
              }
              className="min-w-[120px]"
            />
            <Select
              label="Bulan"
              value={filters.month}
              onChange={(e) =>
                handleFilterChange("month", parseInt(e.target.value))
              }
              options={[
                { value: 1, label: "Januari" },
                { value: 2, label: "Februari" },
                { value: 3, label: "Maret" },
                { value: 4, label: "April" },
                { value: 5, label: "Mei" },
                { value: 6, label: "Juni" },
                { value: 7, label: "Juli" },
                { value: 8, label: "Agustus" },
                { value: 9, label: "September" },
                { value: 10, label: "Oktober" },
                { value: 11, label: "November" },
                { value: 12, label: "Desember" },
              ]}
              className="min-w-[140px]"
            />
          </div>
          <Button onClick={loadMonthlyReport} disabled={isLoading}>
            Terapkan Filter
          </Button>
        </div>
      </Card>

      {/* Download Buttons */}
      <Card>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={downloadAsPNG}
            disabled={isLoading}
            size="sm"
          >
            📷 Download PNG
          </Button>
          <Button
            variant="outline"
            onClick={downloadAsExcel}
            disabled={isLoading}
            size="sm"
          >
            📊 Download Excel
          </Button>
        </div>
      </Card>

      {/* Content */}
      <div ref={reportRef} className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div
              className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDark ? "border-blue-400" : "border-blue-600"
              }`}
            ></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Sewa"
                value={monthlyReport?.totalSewa || 0}
                color="blue"
                icon="📊"
              />
              <StatsCard
                title="Total Pendapatan"
                value={formatCurrency(monthlyReport?.totalPendapatan || 0)}
                color="green"
                icon="💰"
              />
              <StatsCard
                title="Periode"
                value={monthlyReport?.periode || "-"}
                color="purple"
                icon="📅"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  Motor Terpopuler
                </h3>
                <div className="space-y-3">
                  {monthlyReport?.motorTerpopuler.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2"
                    >
                      <span
                        className={
                          isDark ? "text-dark-secondary" : "text-gray-600"
                        }
                      >
                        {item.motor_merk} {item.motor_model}
                      </span>
                      <Badge variant="success">{item.total_sewa} sewa</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  Penyewa Teraktif
                </h3>
                <div className="space-y-3">
                  {monthlyReport?.penyewaTeraktif.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2"
                    >
                      <div>
                        <span
                          className={
                            isDark ? "text-dark-secondary" : "text-gray-600"
                          }
                        >
                          {item.penyewa_nama}
                        </span>
                        <br />
                        <small
                          className={
                            isDark ? "text-dark-muted" : "text-gray-500"
                          }
                        >
                          {item.penyewa_whatsapp}
                        </small>
                      </div>
                      <Badge variant="success">{item.total_sewa} sewa</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyReportPage;
