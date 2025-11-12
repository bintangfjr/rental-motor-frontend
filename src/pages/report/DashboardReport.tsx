// pages/DashboardReport.tsx
import React, { useState, useEffect, useRef } from "react";
import { reportService } from "../../services/reportService";
import { DashboardStats } from "../../types/report";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { useTheme } from "../../hooks/useTheme";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

const DashboardReport: React.FC = () => {
  const { isDark } = useTheme();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const stats = await reportService.getDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsPNG = async () => {
    if (!reportRef.current) return;

    try {
      setIsLoading(true);

      // Sembunyikan elemen yang tidak perlu sebelum capture
      const originalStyles: { [key: string]: string } = {};
      const elementsToHide = reportRef.current.querySelectorAll(
        ".no-print, button, .download-buttons"
      );

      elementsToHide.forEach((el: any) => {
        originalStyles[el.className] = el.style.display;
        el.style.display = "none";
      });

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        quality: 1,
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight,
      });

      // Kembalikan style asli
      elementsToHide.forEach((el: any) => {
        el.style.display = originalStyles[el.className] || "";
      });

      const link = document.createElement("a");
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `Dashboard-Statistik-${timestamp}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsLoading(false);
    } catch (error) {
      console.error("Error generating PNG:", error);
      alert("Gagal mengunduh gambar. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const downloadAsExcel = () => {
    try {
      if (!dashboardStats) {
        alert("Tidak ada data untuk diunduh.");
        return;
      }

      const timestamp = new Date().toISOString().split("T")[0];
      const data = [
        // Header dengan styling
        ["LAPORAN DASHBOARD STATISTIK"],
        [`Periode: ${timestamp}`],
        [""], // Empty row untuk spacing
        ["STATISTIK UTAMA"],
        ["Kategori", "Nilai"],
        ["Sewa Aktif", dashboardStats.jumlahSewaAktif || 0],
        ["Motor Tersedia", dashboardStats.jumlahMotorTersedia || 0],
        [
          "Total Pendapatan",
          `Rp ${formatCurrency(dashboardStats.totalPendapatan || 0)
            .replace("Rp", "")
            .trim()}`,
        ],
        ["Total Penyewa Aktif", dashboardStats.totalPenyewaAktif || 0],
        [""], // Empty row
        ["STATUS MOTOR"],
        ["Status", "Jumlah"],
        ...Object.entries(dashboardStats.motorPerStatus || {}).map(
          ([status, count]) => [
            status.charAt(0).toUpperCase() + status.slice(1),
            count,
          ]
        ),
        [""], // Empty row
        ["SEWA 6 BULAN TERAKHIR"],
        ["Bulan", "Total Sewa"],
        ...(dashboardStats.sewaPerBulan || []).map((item) => [
          item.bulan,
          item.total,
        ]),
        [""], // Empty row
        ["INFORMASI"],
        ["Dibuat pada", new Date().toLocaleString("id-ID")],
        ["Sumber Data", "Sistem Rental Motor"],
      ];

      // Create workbook dengan styling
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(data);

      // Set column widths
      const colWidths = [
        { wch: 25 }, // Kolom A
        { wch: 20 }, // Kolom B
      ];
      ws["!cols"] = colWidths;

      // Add styling untuk header
      if (!ws["!merges"]) ws["!merges"] = [];
      ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
      ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } });

      XLSX.utils.book_append_sheet(wb, ws, "Dashboard Statistik");
      XLSX.writeFile(wb, `Dashboard-Statistik-${timestamp}.xlsx`);
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Gagal mengunduh Excel. Silakan coba lagi.");
    }
  };

  const downloadAsCSV = () => {
    try {
      if (!dashboardStats) {
        alert("Tidak ada data untuk diunduh.");
        return;
      }

      const timestamp = new Date().toISOString().split("T")[0];
      let csvContent = "";

      // Header
      csvContent += "LAPORAN DASHBOARD STATISTIK\n";
      csvContent += `Periode: ${timestamp}\n\n`;

      // Statistik Utama
      csvContent += "STATISTIK UTAMA\n";
      csvContent += "Kategori,Nilai\n";
      csvContent += `Sewa Aktif,${dashboardStats.jumlahSewaAktif || 0}\n`;
      csvContent += `Motor Tersedia,${
        dashboardStats.jumlahMotorTersedia || 0
      }\n`;
      csvContent += `Total Pendapatan,Rp ${formatCurrency(
        dashboardStats.totalPendapatan || 0
      )
        .replace("Rp", "")
        .trim()}\n`;
      csvContent += `Total Penyewa Aktif,${
        dashboardStats.totalPenyewaAktif || 0
      }\n\n`;

      // Status Motor
      csvContent += "STATUS MOTOR\n";
      csvContent += "Status,Jumlah\n";
      Object.entries(dashboardStats.motorPerStatus || {}).forEach(
        ([status, count]) => {
          csvContent += `${
            status.charAt(0).toUpperCase() + status.slice(1)
          },${count}\n`;
        }
      );
      csvContent += "\n";

      // Sewa 6 Bulan Terakhir
      csvContent += "SEWA 6 BULAN TERAKHIR\n";
      csvContent += "Bulan,Total Sewa\n";
      (dashboardStats.sewaPerBulan || []).forEach((item) => {
        csvContent += `${item.bulan},${item.total}\n`;
      });
      csvContent += "\n";

      // Footer
      csvContent += "INFORMASI\n";
      csvContent += `Dibuat pada,${new Date().toLocaleString("id-ID")}\n`;
      csvContent += "Sumber Data,Sistem Rental Motor\n";

      // Create dan download file
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Dashboard-Statistik-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error generating CSV:", error);
      alert("Gagal mengunduh CSV. Silakan coba lagi.");
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
          Dashboard Statistik
        </h1>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/reports/monthly")}
            size="sm"
          >
            📅 Laporan Bulanan
          </Button>
        </div>
      </div>

      {/* Download Buttons */}
      <Card className="download-buttons">
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
          <Button onClick={loadDashboardStats} disabled={isLoading} size="sm">
            🔄 Refresh Data
          </Button>
        </div>
      </Card>

      {/* Content */}
      <div
        ref={reportRef}
        className="space-y-6 bg-white dark:bg-dark-secondary p-6 rounded-lg"
      >
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
            {/* Header Report untuk Download */}
            <div className="text-center mb-8 no-print">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                DASHBOARD STATISTIK
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Periode:{" "}
                {new Date().toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Sewa Aktif"
                value={dashboardStats?.jumlahSewaAktif || 0}
                color="blue"
                icon="🏍️"
              />
              <StatsCard
                title="Motor Tersedia"
                value={dashboardStats?.jumlahMotorTersedia || 0}
                color="green"
                icon="✅"
              />
              <StatsCard
                title="Total Pendapatan"
                value={formatCurrency(dashboardStats?.totalPendapatan || 0)}
                color="purple"
                icon="💰"
              />
              <StatsCard
                title="Penyewa Aktif"
                value={dashboardStats?.totalPenyewaAktif || 0}
                color="orange"
                icon="👥"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  Status Motor
                </h3>
                <div className="space-y-3">
                  {dashboardStats?.motorPerStatus &&
                    Object.entries(dashboardStats.motorPerStatus).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex justify-between items-center py-2"
                        >
                          <span
                            className={`capitalize ${
                              isDark ? "text-dark-secondary" : "text-gray-600"
                            }`}
                          >
                            {status}
                          </span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      )
                    )}
                </div>
              </Card>

              <Card>
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  Sewa 6 Bulan Terakhir
                </h3>
                <div className="space-y-3">
                  {dashboardStats?.sewaPerBulan.map((item) => (
                    <div
                      key={item.bulan}
                      className="flex justify-between items-center py-2"
                    >
                      <span
                        className={
                          isDark ? "text-dark-secondary" : "text-gray-600"
                        }
                      >
                        {item.bulan}
                      </span>
                      <span
                        className={`font-semibold ${
                          isDark ? "text-dark-primary" : "text-gray-900"
                        }`}
                      >
                        {item.total}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Footer untuk Download */}
            <div className="text-center mt-8 pt-4 border-t border-gray-200 dark:border-dark-border no-print">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dicetak pada: {new Date().toLocaleString("id-ID")} | Sumber:
                Sistem Rental Motor
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardReport;
