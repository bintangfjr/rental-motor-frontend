// pages/MotorUsageReport.tsx
import React, { useState, useEffect, useRef } from "react";
import { reportService } from "../../services/reportService";
import { MotorUsage } from "../../types/report";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency } from "../../utils/formatters";
import { useTheme } from "../../hooks/useTheme";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

const MotorUsageReport: React.FC = () => {
  const { isDark } = useTheme();
  const [motorUsage, setMotorUsage] = useState<MotorUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMotorUsage();
  }, []);

  const loadMotorUsage = async () => {
    try {
      setIsLoading(true);
      const usage = await reportService.getMotorUsage(
        filters.startDate,
        filters.endDate
      );
      setMotorUsage(usage);
    } catch (err) {
      console.error("Error loading motor usage:", err);
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
      link.download = `laporan-penggunaan-motor-${
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
      const data = [
        [
          "Laporan Penggunaan Motor",
          `Periode: ${filters.startDate} - ${filters.endDate}`,
        ],
        [],
        [
          "Motor",
          "Plat Nomor",
          "Status",
          "Total Sewa",
          "Total Durasi (hari)",
          "Total Pendapatan",
          "Rata-rata per Sewa",
          "Pendapatan per Hari",
        ],
        ...motorUsage.map((motor) => [
          `${motor.merk} ${motor.model}`,
          motor.plat_nomor,
          motor.status,
          motor.total_sewa,
          motor.total_durasi,
          motor.total_pendapatan,
          motor.total_sewa > 0 ? motor.total_pendapatan / motor.total_sewa : 0,
          motor.total_durasi > 0
            ? motor.total_pendapatan / motor.total_durasi
            : 0,
        ]),
      ];

      if (data.length === 0) {
        alert("Tidak ada data untuk diunduh.");
        return;
      }

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Penggunaan Motor");
      XLSX.writeFile(
        wb,
        `laporan-penggunaan-motor-${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Gagal mengunduh Excel. Silakan coba lagi.");
    }
  };

  const downloadAsCSV = () => {
    try {
      let csvContent =
        "Motor,Plat Nomor,Status,Total Sewa,Total Durasi (hari),Total Pendapatan,Rata-rata per Sewa,Pendapatan per Hari\n";

      motorUsage.forEach((motor) => {
        csvContent += `${motor.merk} ${motor.model},${motor.plat_nomor},${
          motor.status
        },${motor.total_sewa},${motor.total_durasi},${motor.total_pendapatan},${
          motor.total_sewa > 0 ? motor.total_pendapatan / motor.total_sewa : 0
        },${
          motor.total_durasi > 0
            ? motor.total_pendapatan / motor.total_durasi
            : 0
        }\n`;
      });

      if (!csvContent) {
        alert("Tidak ada data untuk diunduh.");
        return;
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `laporan-penggunaan-motor-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error generating CSV:", error);
      alert("Gagal mengunduh CSV. Silakan coba lagi.");
    }
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
          Laporan Penggunaan Motor
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
              type="date"
              label="Dari Tanggal"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
            <Input
              type="date"
              label="Sampai Tanggal"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
          <Button onClick={loadMotorUsage} disabled={isLoading}>
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
          <Button
            variant="outline"
            onClick={downloadAsCSV}
            disabled={isLoading}
            size="sm"
          >
            📄 Download CSV
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
          <div className="grid grid-cols-1 gap-4">
            {motorUsage.map((motor) => (
              <Card key={motor.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        isDark ? "text-dark-primary" : "text-gray-900"
                      }`}
                    >
                      {motor.merk} {motor.model} ({motor.plat_nomor})
                    </h3>
                    <p
                      className={
                        isDark ? "text-dark-secondary" : "text-gray-600"
                      }
                    >
                      Status: <Badge variant="secondary">{motor.status}</Badge>
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(motor.total_pendapatan)}
                    </p>
                    <p
                      className={
                        isDark ? "text-dark-secondary" : "text-gray-600"
                      }
                    >
                      {motor.total_sewa} sewa
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span
                      className={isDark ? "text-dark-muted" : "text-gray-600"}
                    >
                      Total Durasi:
                    </span>
                    <p
                      className={`font-semibold ${
                        isDark ? "text-dark-primary" : "text-gray-900"
                      }`}
                    >
                      {motor.total_durasi} hari
                    </p>
                  </div>
                  <div>
                    <span
                      className={isDark ? "text-dark-muted" : "text-gray-600"}
                    >
                      Rata-rata per Sewa:
                    </span>
                    <p
                      className={`font-semibold ${
                        isDark ? "text-dark-primary" : "text-gray-900"
                      }`}
                    >
                      {motor.total_sewa > 0
                        ? formatCurrency(
                            motor.total_pendapatan / motor.total_sewa
                          )
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span
                      className={isDark ? "text-dark-muted" : "text-gray-600"}
                    >
                      Pendapatan per Hari:
                    </span>
                    <p
                      className={`font-semibold ${
                        isDark ? "text-dark-primary" : "text-gray-900"
                      }`}
                    >
                      {motor.total_durasi > 0
                        ? formatCurrency(
                            motor.total_pendapatan / motor.total_durasi
                          )
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span
                      className={isDark ? "text-dark-muted" : "text-gray-600"}
                    >
                      Efisiensi:
                    </span>
                    <p
                      className={`font-semibold ${
                        isDark ? "text-dark-primary" : "text-gray-900"
                      }`}
                    >
                      {motor.total_durasi > 0
                        ? (
                            (motor.total_sewa / motor.total_durasi) *
                            100
                          ).toFixed(1) + "%"
                        : "-"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MotorUsageReport;
