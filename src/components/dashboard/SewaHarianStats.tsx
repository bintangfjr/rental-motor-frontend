import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  dashboardService,
  SewaHarianResponse,
} from "@/services/dashboardService";
import { useTheme } from "@/hooks/useTheme";

interface SewaHarianStatsProps {
  className?: string;
  compact?: boolean;
}

export const SewaHarianStats: React.FC<SewaHarianStatsProps> = ({
  className,
  compact = false,
}) => {
  const { isDark } = useTheme();
  const [data, setData] = useState<SewaHarianResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7days" | "30days">("7days");
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // ✅ PERBAIKAN: Gunakan useCallback untuk fetchData
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await dashboardService.getSewaHarianStats(period);
      setData(stats);
      setCurrentPage(0); // Reset ke halaman pertama saat ganti periode
    } catch (err) {
      console.error("Error fetching sewa harian stats:", err);
      setError(
        err instanceof Error ? err.message : "Gagal memuat data statistik"
      );
    } finally {
      setLoading(false);
    }
  }, [period]); // ✅ PERBAIKAN: Tambahkan period sebagai dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]); // ✅ PERBAIKAN: Tambahkan fetchData sebagai dependency

  // ✅ PERBAIKAN: Setup canvas dimensions untuk kualitas yang lebih baik
  const setupCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    // Set display size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Set actual size in memory (scaled for retina displays)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Normalize coordinate system to use CSS pixels
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  // ✅ PERBAIKAN: Draw chart dengan data yang benar dan kualitas tinggi
  const drawAnimatedChart = useCallback(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup canvas dimensions
    setupCanvas(canvas);

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas dengan background transparan
    ctx.clearRect(0, 0, width, height);

    // ✅ PERBAIKAN: Gunakan data sesuai periode
    const trendData =
      period === "7days" ? data.tren_harian.slice(-7) : data.tren_harian;
    const values = trendData.map((d) => d.jumlah_sewa);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values);

    // Animation state
    let progress = 0;
    const duration = 1000; // 1 second untuk animasi lebih cepat
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      progress = Math.min(elapsed / duration, 1);

      // Smooth easing function
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // ✅ PERBAIKAN: Draw background grid dengan garis yang lebih halus
      ctx.strokeStyle = isDark
        ? "rgba(55, 65, 81, 0.5)"
        : "rgba(229, 231, 235, 0.8)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);

      // Horizontal grid lines
      const gridLines = 4;
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }

      // Draw data points and lines
      if (trendData.length > 0) {
        const segmentWidth = chartWidth / Math.max(trendData.length - 1, 1);
        const pointRadius = 3;

        // ✅ PERBAIKAN: Draw smooth line dengan gradient
        // Create gradient for line
        const gradient = ctx.createLinearGradient(
          padding.left,
          padding.top,
          padding.left,
          height - padding.bottom
        );
        gradient.addColorStop(
          0,
          isDark ? "rgba(59, 130, 246, 0.8)" : "rgba(37, 99, 235, 0.8)"
        );
        gradient.addColorStop(
          1,
          isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.4)"
        );

        // Draw line path
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        trendData.forEach((day, index) => {
          const x = padding.left + segmentWidth * index;
          const valueProgress = Math.min(
            (easeProgress * (index + 1)) / trendData.length,
            1
          );
          const animatedValue =
            minValue + (day.jumlah_sewa - minValue) * valueProgress;
          const y =
            height - padding.bottom - (animatedValue / maxValue) * chartHeight;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // ✅ PERBAIKAN: Draw area under line
        if (progress > 0.5) {
          ctx.beginPath();
          ctx.moveTo(padding.left, height - padding.bottom);

          trendData.forEach((day) => {
            // ✅ PERBAIKAN: Hapus parameter index yang tidak digunakan
            const x = padding.left + segmentWidth * trendData.indexOf(day);
            const valueProgress = Math.min(
              (easeProgress * (trendData.indexOf(day) + 1)) / trendData.length,
              1
            );
            const animatedValue =
              minValue + (day.jumlah_sewa - minValue) * valueProgress;
            const y =
              height -
              padding.bottom -
              (animatedValue / maxValue) * chartHeight;

            ctx.lineTo(x, y);
          });

          ctx.lineTo(width - padding.right, height - padding.bottom);
          ctx.closePath();

          const areaGradient = ctx.createLinearGradient(
            padding.left,
            padding.top,
            padding.left,
            height - padding.bottom
          );
          areaGradient.addColorStop(
            0,
            isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(37, 99, 235, 0.2)"
          );
          areaGradient.addColorStop(
            1,
            isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(37, 99, 235, 0.05)"
          );

          ctx.fillStyle = areaGradient;
          ctx.fill();
        }

        // ✅ PERBAIKAN: Draw points dengan efek yang lebih tajam
        trendData.forEach((day) => {
          // ✅ PERBAIKAN: Hapus parameter index yang tidak digunakan
          const index = trendData.indexOf(day);
          const x = padding.left + segmentWidth * index;
          const valueProgress = Math.min(
            (easeProgress * (index + 1)) / trendData.length,
            1
          );
          const animatedValue =
            minValue + (day.jumlah_sewa - minValue) * valueProgress;
          const y =
            height - padding.bottom - (animatedValue / maxValue) * chartHeight;

          // Point glow effect
          if (easeProgress > 0.3) {
            ctx.beginPath();
            ctx.arc(x, y, pointRadius * 2, 0, 2 * Math.PI);
            ctx.fillStyle = isDark
              ? "rgba(59, 130, 246, 0.2)"
              : "rgba(37, 99, 235, 0.15)";
            ctx.fill();
          }

          // Main point dengan border
          if (easeProgress > 0.5) {
            ctx.beginPath();
            ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
            ctx.fillStyle = isDark ? "#60a5fa" : "#2563eb";
            ctx.fill();

            // White border untuk kontras
            ctx.beginPath();
            ctx.arc(x, y, pointRadius - 0.5, 0, 2 * Math.PI);
            ctx.strokeStyle = isDark ? "#1e40af" : "#1d4ed8";
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Draw value labels
          if (easeProgress === 1 && day.jumlah_sewa > 0) {
            ctx.fillStyle = isDark ? "#e5e7eb" : "#374151";
            ctx.font =
              "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(day.jumlah_sewa.toString(), x, y - 8);
          }
        });

        // ✅ PERBAIKAN: Draw X-axis labels (dates) dengan font yang lebih baik
        ctx.fillStyle = isDark ? "#9ca3af" : "#6b7280";
        ctx.font =
          "500 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        trendData.forEach((day) => {
          // ✅ PERBAIKAN: Hapus parameter index yang tidak digunakan
          const index = trendData.indexOf(day);
          const x = padding.left + segmentWidth * index;
          const date = new Date(day.tanggal);
          const label = date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          });
          ctx.fillText(label, x, height - padding.bottom + 8);
        });

        // Draw Y-axis labels
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (let i = 0; i <= 4; i++) {
          const value = Math.round((maxValue / 4) * i);
          const y = height - padding.bottom - (chartHeight / 4) * i;
          ctx.fillText(value.toString(), padding.left - 8, y);
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [data, isDark, setupCanvas, period]); // ✅ PERBAIKAN: Hapus isExpanded dari dependencies

  useEffect(() => {
    if (data && canvasRef.current) {
      drawAnimatedChart();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, isDark, drawAnimatedChart]); // ✅ PERBAIKAN: Hapus isExpanded dari dependencies

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (data && canvasRef.current) {
        drawAnimatedChart();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data, drawAnimatedChart]);

  // Format persentase dengan warna yang sesuai
  const getPercentageColor = (percentage: number) => {
    if (percentage > 0) return "text-green-600 dark:text-green-400";
    if (percentage < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getPercentageIcon = (percentage: number) => {
    if (percentage > 0) return <TrendingUp className="h-4 w-4" />;
    if (percentage < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  const getButtonVariant = (isActive: boolean) => {
    return isActive ? "primary" : "outline";
  };

  // ✅ PERBAIKAN: Fungsi untuk tabel data dengan pagination
  const renderDataTable = () => {
    if (!data || !isExpanded) return null;

    const itemsPerPage = 10;
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.tren_harian.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.tren_harian.length / itemsPerPage);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return (
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Data Detail Sewa Harian ({period === "7days" ? "7 Hari" : "30 Hari"})
        </h3>

        <div
          ref={tableContainerRef}
          className="max-h-64 overflow-y-auto border rounded-lg"
        >
          <table className="w-full text-sm">
            <thead
              className={`sticky top-0 ${
                isDark
                  ? "bg-gray-800 text-gray-200"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <tr>
                <th className="p-3 text-left font-semibold">Tanggal</th>
                <th className="p-3 text-right font-semibold">Jumlah Sewa</th>
                <th className="p-3 text-right font-semibold">
                  Total Pendapatan
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map(
                (
                  day // ✅ PERBAIKAN: Hapus parameter index yang tidak digunakan
                ) => (
                  <tr
                    key={day.tanggal}
                    className={`border-b ${
                      isDark
                        ? "border-gray-700 hover:bg-gray-800"
                        : "border-gray-200 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="p-3">
                      {new Date(day.tanggal).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          day.jumlah_sewa > 0
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {day.jumlah_sewa} sewa
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(day.total_pendapatan)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Halaman {currentPage + 1} dari {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-2"
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistik Sewa Harian
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-32 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="text-lg font-semibold">Statistik Sewa Harian</div>
        </CardHeader>
        <CardContent>
          <div
            className={`p-3 rounded-lg text-center ${
              isDark ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"
            }`}
          >
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="mt-2"
            >
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="text-lg font-semibold">Statistik Sewa Harian</div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            Tidak ada data yang tersedia
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentageColor = getPercentageColor(data.persentase_perubahan);
  const PercentageIcon = getPercentageIcon(data.persentase_perubahan);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistik Sewa Harian
          </div>
          <div className="flex items-center gap-2">
            {!compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(!isExpanded);
                  setCurrentPage(0); // Reset ke halaman pertama saat expand
                }}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
            <Calendar
              className={`h-4 w-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-3 rounded-lg ${
              isDark ? "bg-blue-900/20" : "bg-blue-50"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "text-blue-300" : "text-blue-600"
              }`}
            >
              Hari Ini
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.hari_ini}
            </p>
          </div>

          <div
            className={`p-3 rounded-lg ${
              isDark ? "bg-green-900/20" : "bg-green-50"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "text-green-300" : "text-green-600"
              }`}
            >
              Kemarin
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.kemarin}
            </p>
          </div>
        </div>

        {/* Percentage Change */}
        <div
          className={`flex items-center justify-center p-2 rounded-lg ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            {PercentageIcon}
            <span className={`text-sm font-medium ${percentageColor}`}>
              {data.persentase_perubahan >= 0 ? "+" : ""}
              {data.persentase_perubahan}% dari kemarin
            </span>
          </div>
        </div>

        {/* ✅ PERBAIKAN: Animated Chart dengan container ref */}
        {!compact && (
          <div
            ref={containerRef}
            className={`relative ${
              isExpanded ? "h-64" : "h-48"
            } transition-all duration-300`}
          >
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        )}

        {/* Period Toggle */}
        {!compact && (
          <div className="flex space-x-2">
            <Button
              variant={getButtonVariant(period === "7days")}
              size="sm"
              onClick={() => setPeriod("7days")}
              className="flex-1"
            >
              7 Hari
            </Button>
            <Button
              variant={getButtonVariant(period === "30days")}
              size="sm"
              onClick={() => setPeriod("30days")}
              className="flex-1"
            >
              30 Hari
            </Button>
          </div>
        )}

        {/* ✅ PERBAIKAN: Tampilkan tabel data ketika expanded */}
        {renderDataTable()}

        {/* Compact View */}
        {compact && (
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              {PercentageIcon}
              <span className={`text-sm font-medium ${percentageColor}`}>
                {data.persentase_perubahan >= 0 ? "+" : ""}
                {data.persentase_perubahan}%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data.tren_harian
                .slice(-7)
                .reduce((sum, day) => sum + day.jumlah_sewa, 0)}{" "}
              sewa dalam 7 hari
            </p>
          </div>
        )}

        {/* Trend Summary */}
        {!compact && data.tren_harian.length > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div
              className={`p-2 rounded ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Rata-rata
              </p>
              <p className="text-sm font-semibold">
                {Math.round(
                  data.tren_harian.reduce(
                    (sum, day) => sum + day.jumlah_sewa,
                    0
                  ) / data.tren_harian.length
                )}
              </p>
            </div>
            <div
              className={`p-2 rounded ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tertinggi
              </p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {Math.max(...data.tren_harian.map((d) => d.jumlah_sewa))}
              </p>
            </div>
            <div
              className={`p-2 rounded ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Terendah
              </p>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                {Math.min(...data.tren_harian.map((d) => d.jumlah_sewa))}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
