import React, { useState, useEffect, useRef } from "react";
import { reportService } from "../../services/reportService";
import {
  DashboardStats,
  MonthlyReport,
  MotorUsage,
  FinancialReport,
} from "../../types/report";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { useTheme } from "../../hooks/useTheme";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

const ReportView: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "monthly" | "motor" | "financial"
  >("dashboard");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(
    null
  );
  const [motorUsage, setMotorUsage] = useState<MotorUsage[]>([]);
  const [financialReport, setFinancialReport] =
    useState<FinancialReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

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

  const loadFinancialReport = async () => {
    try {
      setIsLoading(true);
      const financial = await reportService.getFinancialReports(
        filters.startDate,
        filters.endDate
      );
      setFinancialReport(financial);
    } catch (err) {
      console.error("Error loading financial report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (
    tab: "dashboard" | "monthly" | "motor" | "financial"
  ) => {
    setActiveTab(tab);
    switch (tab) {
      case "monthly":
        loadMonthlyReport();
        break;
      case "motor":
        loadMotorUsage();
        break;
      case "financial":
        loadFinancialReport();
        break;
      default:
        loadDashboardStats();
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterSubmit = () => {
    switch (activeTab) {
      case "monthly":
        loadMonthlyReport();
        break;
      case "motor":
        loadMotorUsage();
        break;
      case "financial":
        loadFinancialReport();
        break;
      default:
        loadDashboardStats();
    }
  };

  // Fungsi untuk download sebagai PNG
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
      link.download = `laporan-${activeTab}-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
      alert("Gagal mengunduh gambar. Silakan coba lagi.");
    }
  };

  // Fungsi untuk download sebagai Excel
  const downloadAsExcel = () => {
    try {
      let data: any[] = [];
      let fileName = `laporan-${activeTab}-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      switch (activeTab) {
        case "dashboard":
          if (dashboardStats) {
            data = [
              ["Statistik Dashboard"],
              ["Sewa Aktif", dashboardStats.jumlahSewaAktif || 0],
              ["Motor Tersedia", dashboardStats.jumlahMotorTersedia || 0],
              ["Total Pendapatan", dashboardStats.totalPendapatan || 0],
              ["Total Penyewa Aktif", dashboardStats.totalPenyewaAktif || 0],
              [],
              ["Status Motor"],
              ...Object.entries(dashboardStats.motorPerStatus || {}).map(
                ([status, count]) => [status, count]
              ),
              [],
              ["Sewa 6 Bulan Terakhir"],
              ...(dashboardStats.sewaPerBulan || []).map((item) => [
                item.bulan,
                item.total,
              ]),
            ];
          }
          break;

        case "monthly":
          if (monthlyReport) {
            data = [
              ["Laporan Bulanan", monthlyReport.periode || "-"],
              ["Total Sewa", monthlyReport.totalSewa || 0],
              ["Total Pendapatan", monthlyReport.totalPendapatan || 0],
              [],
              ["Motor Terpopuler"],
              ...(monthlyReport.motorTerpopuler || []).map((item) => [
                `${item.motor.merk} ${item.motor.model}`,
                `${item._count.id} sewa`,
              ]),
              [],
              ["Penyewa Teraktif"],
              ...(monthlyReport.penyewaTeraktif || []).map((item) => [
                item.penyewa.nama,
                `${item._count.id} sewa`,
              ]),
            ];
          }
          break;

        case "motor":
          data = [
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
              motor.total_sewa > 0
                ? motor.total_pendapatan / motor.total_sewa
                : 0,
              motor.total_durasi > 0
                ? motor.total_pendapatan / motor.total_durasi
                : 0,
            ]),
          ];
          break;

        case "financial":
          if (financialReport) {
            data = [
              [
                "Laporan Keuangan",
                `Periode: ${filters.startDate} - ${filters.endDate}`,
              ],
              ["Total Pendapatan", financialReport.totalPendapatan || 0],
              ["Total Denda", financialReport.totalDenda || 0],
              [
                "Total Keseluruhan",
                (financialReport.totalPendapatan || 0) +
                  (financialReport.totalDenda || 0),
              ],
              [],
              ["Pendapatan per Bulan"],
              ["Bulan", "Pendapatan"],
              ...(financialReport.pendapatanPerBulan || []).map((item) => [
                item.bulan,
                item.pendapatan,
              ]),
              [],
              ["Pendapatan per Motor"],
              ["Motor", "Pendapatan"],
              ...(financialReport.pendapatanPerMotor || []).map((item) => [
                `${item.motor.merk} ${item.motor.model}`,
                item._sum.total_harga,
              ]),
            ];
          }
          break;
      }

      if (data.length === 0) {
        alert("Tidak ada data untuk diunduh.");
        return;
      }

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan");
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Gagal mengunduh Excel. Silakan coba lagi.");
    }
  };

  // Fungsi untuk download sebagai CSV
  const downloadAsCSV = () => {
    try {
      let csvContent = "";
      let fileName = `laporan-${activeTab}-${
        new Date().toISOString().split("T")[0]
      }.csv`;

      switch (activeTab) {
        case "dashboard":
          if (dashboardStats) {
            csvContent = "Kategori,Nilai\n";
            csvContent += `Sewa Aktif,${dashboardStats.jumlahSewaAktif || 0}\n`;
            csvContent += `Motor Tersedia,${
              dashboardStats.jumlahMotorTersedia || 0
            }\n`;
            csvContent += `Total Pendapatan,${
              dashboardStats.totalPendapatan || 0
            }\n`;
            csvContent += `Total Penyewa Aktif,${
              dashboardStats.totalPenyewaAktif || 0
            }\n`;
            csvContent += "\nStatus Motor\n";
            Object.entries(dashboardStats.motorPerStatus || {}).forEach(
              ([status, count]) => {
                csvContent += `${status},${count}\n`;
              }
            );
            csvContent += "\nSewa 6 Bulan Terakhir\n";
            (dashboardStats.sewaPerBulan || []).forEach((item) => {
              csvContent += `${item.bulan},${item.total}\n`;
            });
          }
          break;

        case "motor":
          csvContent =
            "Motor,Plat Nomor,Status,Total Sewa,Total Durasi (hari),Total Pendapatan,Rata-rata per Sewa,Pendapatan per Hari\n";
          motorUsage.forEach((motor) => {
            csvContent += `${motor.merk} ${motor.model},${motor.plat_nomor},${
              motor.status
            },${motor.total_sewa},${motor.total_durasi},${
              motor.total_pendapatan
            },${
              motor.total_sewa > 0
                ? motor.total_pendapatan / motor.total_sewa
                : 0
            },${
              motor.total_durasi > 0
                ? motor.total_pendapatan / motor.total_durasi
                : 0
            }\n`;
          });
          break;

        default:
          // Untuk tab lain, gunakan data yang sama dengan Excel
          downloadAsExcel();
          return;
      }

      if (!csvContent) {
        alert("Tidak ada data untuk diunduh.");
        return;
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error generating CSV:", error);
      alert("Gagal mengunduh CSV. Silakan coba lagi.");
    }
  };

  // Stats Card Component
  const StatsCard: React.FC<{
    title: string;
    value: string | number;
    color: "blue" | "green" | "purple" | "orange" | "red";
    icon?: React.ReactNode;
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

  const renderDashboardTab = () => (
    <div className="space-y-6">
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
                  className={isDark ? "text-dark-secondary" : "text-gray-600"}
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
    </div>
  );

  const renderMonthlyTab = () => (
    <div className="space-y-6">
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
                  className={isDark ? "text-dark-secondary" : "text-gray-600"}
                >
                  {item.motor.merk} {item.motor.model}
                </span>
                <Badge variant="success">{item._count.id} sewa</Badge>
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
                <span
                  className={isDark ? "text-dark-secondary" : "text-gray-600"}
                >
                  {item.penyewa.nama}
                </span>
                <Badge variant="success">{item._count.id} sewa</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderMotorTab = () => (
    <div className="space-y-6">
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
                <p className={isDark ? "text-dark-secondary" : "text-gray-600"}>
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
                <p className={isDark ? "text-dark-secondary" : "text-gray-600"}>
                  {motor.total_sewa} sewa
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className={isDark ? "text-dark-muted" : "text-gray-600"}>
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
                <span className={isDark ? "text-dark-muted" : "text-gray-600"}>
                  Rata-rata per Sewa:
                </span>
                <p
                  className={`font-semibold ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {motor.total_sewa > 0
                    ? formatCurrency(motor.total_pendapatan / motor.total_sewa)
                    : "-"}
                </p>
              </div>
              <div>
                <span className={isDark ? "text-dark-muted" : "text-gray-600"}>
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
                <span className={isDark ? "text-dark-muted" : "text-gray-600"}>
                  Efisiensi:
                </span>
                <p
                  className={`font-semibold ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  {motor.total_durasi > 0
                    ? ((motor.total_sewa / motor.total_durasi) * 100).toFixed(
                        1
                      ) + "%"
                    : "-"}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Pendapatan"
          value={formatCurrency(financialReport?.totalPendapatan || 0)}
          color="blue"
          icon="💰"
        />
        <StatsCard
          title="Total Denda"
          value={formatCurrency(financialReport?.totalDenda || 0)}
          color="red"
          icon="⚡"
        />
        <StatsCard
          title="Total Keseluruhan"
          value={formatCurrency(
            (financialReport?.totalPendapatan || 0) +
              (financialReport?.totalDenda || 0)
          )}
          color="green"
          icon="📈"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3
            className={`text-lg font-semibold mb-4 ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Pendapatan per Bulan
          </h3>
          <div className="space-y-3">
            {financialReport?.pendapatanPerBulan.map((item) => (
              <div
                key={item.bulan}
                className="flex justify-between items-center py-2"
              >
                <span
                  className={isDark ? "text-dark-secondary" : "text-gray-600"}
                >
                  {item.bulan}
                </span>
                <span
                  className={`font-semibold ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {formatCurrency(item.pendapatan)}
                </span>
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
            Pendapatan per Motor
          </h3>
          <div className="space-y-3">
            {financialReport?.pendapatanPerMotor.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2"
              >
                <span
                  className={isDark ? "text-dark-secondary" : "text-gray-600"}
                >
                  {item.motor.merk} {item.motor.model}
                </span>
                <span
                  className={`font-semibold ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {formatCurrency(item._sum.total_harga)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderFilters = () => {
    switch (activeTab) {
      case "monthly":
        return (
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
        );
      case "motor":
      case "financial":
        return (
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
        );
      default:
        return null;
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
          Laporan dan Statistik
        </h1>

        {/* Download Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={downloadAsPNG}
            disabled={isLoading}
            size="sm"
          >
            📷 PNG
          </Button>
          <Button
            variant="outline"
            onClick={downloadAsExcel}
            disabled={isLoading}
            size="sm"
          >
            📊 Excel
          </Button>
          <Button
            variant="outline"
            onClick={downloadAsCSV}
            disabled={isLoading}
            size="sm"
          >
            📄 CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-0">
        <nav className="flex space-x-8 px-6">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "monthly", label: "Bulanan" },
            { id: "motor", label: "Penggunaan Motor" },
            { id: "financial", label: "Keuangan" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-brand-blue text-brand-blue"
                  : `border-transparent ${
                      isDark
                        ? "text-dark-secondary hover:text-dark-primary hover:border-dark-border"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </Card>

      {/* Filters */}
      {renderFilters() && (
        <Card>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            {renderFilters()}
            <Button onClick={handleFilterSubmit} disabled={isLoading}>
              Terapkan Filter
            </Button>
          </div>
        </Card>
      )}

      {/* Content */}
      <div ref={reportRef} className="rm-card p-6">
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
            {activeTab === "dashboard" && renderDashboardTab()}
            {activeTab === "monthly" && renderMonthlyTab()}
            {activeTab === "motor" && renderMotorTab()}
            {activeTab === "financial" && renderFinancialTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportView;
