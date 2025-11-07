import React, { useState, useEffect } from "react";
import { penyewaService } from "../../services/penyewaService";
import { HistorySewa, HistoryStats, CreditScore } from "../../types/penyewa";
import { useTheme } from "../../hooks/useTheme";
import { CreditScoreCircle } from "./CreditScoreCircle";

interface PenyewaHistoryProps {
  penyewaId: number;
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format durasi keterlambatan
const formatKeterlambatan = (menit: number) => {
  if (!menit || menit === 0) return "-";

  const jam = Math.floor(menit / 60);
  const sisaMenit = menit % 60;

  if (jam > 0) {
    return `${jam} jam ${sisaMenit} menit`;
  }
  return `${sisaMenit} menit`;
};

// Calculate credit score based on history
const calculateCreditScore = (history: HistorySewa[]): CreditScore => {
  if (history.length === 0) {
    return {
      score: 100,
      level: "Excellent",
      color: "#10B981",
      description: "Belum ada riwayat sewa",
      factors: {
        positive: ["Belum ada riwayat sewa"],
        negative: [],
      },
    };
  }

  let score = 100;
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];

  // Factor 1: Percentage of completed rentals
  const completedRentals = history.filter(
    (h) => h.status_selesai === "Selesai"
  ).length;
  const completionRate = completedRentals / history.length;

  if (completionRate === 1) {
    positiveFactors.push("Semua sewa diselesaikan dengan baik");
    score += 5; // Bonus untuk penyelesaian sempurna
  } else if (completionRate >= 0.8) {
    positiveFactors.push("Mayoritas sewa diselesaikan");
  } else {
    score -= (1 - completionRate) * 25; // Max penalty 25 points
    if (completionRate === 0) {
      negativeFactors.push("Tidak ada sewa yang selesai");
    } else {
      negativeFactors.push(
        `${Math.round((1 - completionRate) * 100)}% sewa tidak selesai`
      );
    }
  }

  // Factor 2: Late returns (based on keterlambatan_menit)
  const lateReturns = history.filter(
    (h) => (h.keterlambatan_menit || 0) > 0
  ).length;
  const lateReturnRate = lateReturns / history.length;

  if (lateReturnRate === 0) {
    positiveFactors.push("Tidak pernah terlambat mengembalikan");
    score += 10; // Bonus untuk tepat waktu
  } else {
    // Penalty based on late return rate
    score -= lateReturnRate * 30; // Max penalty 30 points

    // Additional penalty for severity of lateness
    const totalLateMinutes = history.reduce(
      (sum, h) => sum + (h.keterlambatan_menit || 0),
      0
    );
    const avgLateMinutes = totalLateMinutes / lateReturns;

    if (avgLateMinutes > 60 * 24) {
      // More than 24 hours average
      score -= 15;
      negativeFactors.push(
        `${lateReturns} sewa terlambat (rata-rata ${Math.round(
          avgLateMinutes / 60
        )} jam)`
      );
    } else if (avgLateMinutes > 60 * 2) {
      // More than 2 hours average
      score -= 10;
      negativeFactors.push(
        `${lateReturns} sewa terlambat (rata-rata ${Math.round(
          avgLateMinutes / 60
        )} jam)`
      );
    } else {
      negativeFactors.push(`${lateReturns} sewa terlambat dikembalikan`);
    }
  }

  // Factor 3: Fines amount and frequency
  const rentalsWithFines = history.filter((h) => (h.denda || 0) > 0).length;
  const fineRate = rentalsWithFines / history.length;
  const totalFines = history.reduce((sum, h) => sum + (h.denda || 0), 0);
  const totalRevenue = history.reduce((sum, h) => sum + h.harga, 0);
  const fineToRevenueRatio = totalRevenue > 0 ? totalFines / totalRevenue : 0;

  if (fineRate === 0) {
    positiveFactors.push("Tidak ada riwayat denda");
  } else {
    // Penalty for having fines
    score -= fineRate * 20; // Max penalty 20 points

    // Additional penalty for high fine amounts
    if (fineToRevenueRatio > 0.5) {
      // Fines > 50% of revenue
      score -= 15;
      negativeFactors.push("Total denda sangat tinggi");
    } else if (fineToRevenueRatio > 0.2) {
      // Fines > 20% of revenue
      score -= 10;
      negativeFactors.push("Total denda signifikan");
    } else if (fineToRevenueRatio > 0.1) {
      // Fines > 10% of revenue
      score -= 5;
      negativeFactors.push("Memiliki riwayat denda");
    } else {
      negativeFactors.push(`${rentalsWithFines} sewa kena denda ringan`);
    }
  }

  // Factor 4: Recent behavior (weight last 3 rentals more heavily)
  const recentRentals = history.slice(0, Math.min(3, history.length));
  if (recentRentals.length > 0) {
    const recentCompleted = recentRentals.filter(
      (h) => h.status_selesai === "Selesai"
    ).length;
    const recentLate = recentRentals.filter(
      (h) => (h.keterlambatan_menit || 0) > 0
    ).length;
    const recentFines = recentRentals.filter((h) => (h.denda || 0) > 0).length;

    if (recentCompleted === recentRentals.length) {
      positiveFactors.push("Sewa terbaru diselesaikan dengan baik");
    } else if (recentCompleted === 0) {
      score -= 10;
      negativeFactors.push("Sewa terbaru tidak diselesaikan");
    }

    if (recentLate > 0) {
      score -= 8;
      negativeFactors.push("Sewa terakhir terlambat");
    }

    if (recentFines > 0) {
      score -= 7;
      negativeFactors.push("Sewa terakhir kena denda");
    }
  }

  // Factor 5: Rental frequency and consistency
  if (history.length >= 5) {
    positiveFactors.push("Pengalaman sewa yang cukup");
    score += 5;
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determine level and description
  let level: CreditScore["level"];
  let description: string;
  let color: string;

  if (score >= 85) {
    level = "Excellent";
    color = "#10B981";
    description = "Penyewa sangat terpercaya";
  } else if (score >= 70) {
    level = "Good";
    color = "#3B82F6";
    description = "Penyewa dapat diandalkan";
  } else if (score >= 50) {
    level = "Fair";
    color = "#F59E0B";
    description = "Perlu perhatian khusus";
  } else if (score >= 30) {
    level = "Poor";
    color = "#EF4444";
    description = "Berisiko tinggi";
  } else {
    level = "Very Poor";
    color = "#7C2D12";
    description = "Sangat berisiko";
  }

  return {
    score,
    level,
    color,
    description,
    factors: {
      positive: positiveFactors,
      negative: negativeFactors,
    },
  };
};

export const PenyewaHistory: React.FC<PenyewaHistoryProps> = ({
  penyewaId,
}) => {
  const { isDark } = useTheme();
  const [historySewa, setHistorySewa] = useState<HistorySewa[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const loadHistoryData = async () => {
    try {
      setIsLoading(true);
      const [historyData, statsData] = await Promise.all([
        penyewaService.getPenyewaHistory(penyewaId),
        penyewaService.getPenyewaHistoryStats(penyewaId),
      ]);

      setHistorySewa(historyData);
      setStats(statsData);

      // Calculate credit score
      const score = calculateCreditScore(historyData);
      setCreditScore(score);
    } catch (error) {
      console.error("Error loading history data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const historyData = await penyewaService.getPenyewaHistory(penyewaId);
      setHistorySewa(historyData);

      // Recalculate credit score
      const score = calculateCreditScore(historyData);
      setCreditScore(score);
    } catch (error) {
      console.error("Error refreshing history:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, [penyewaId]);

  if (isLoading) {
    return (
      <div
        className={`rm-card ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex justify-center items-center py-12">
          <div
            className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
              isDark ? "border-blue-400" : "border-blue-600"
            }`}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Credit Score & Statistik */}
      <div
        className={`rm-card ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`px-6 py-4 border-b ${
            isDark ? "border-dark-border" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-lg font-semibold ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Credit Score & Statistik
            </h2>
            <button
              onClick={refreshHistory}
              disabled={isHistoryLoading}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
                isDark
                  ? "bg-dark-secondary hover:bg-dark-secondary/80 text-dark-primary"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              } disabled:opacity-50`}
            >
              {isHistoryLoading ? (
                <div
                  className={`animate-spin rounded-full h-4 w-4 border-b-2 ${
                    isDark ? "border-blue-400" : "border-blue-600"
                  }`}
                ></div>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Credit Score Section */}
            <div
              className={`p-6 rounded-lg border ${
                isDark
                  ? "border-dark-border bg-dark-secondary/30"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <CreditScoreCircle score={creditScore?.score || 100} />

                <div className="mt-4">
                  <h3
                    className={`text-lg font-semibold ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
                    {creditScore?.level}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-dark-muted" : "text-gray-600"
                    }`}
                  >
                    {creditScore?.description}
                  </p>
                </div>

                {/* Factors */}
                <div className="mt-4 w-full">
                  {creditScore?.factors.positive &&
                    creditScore.factors.positive.length > 0 && (
                      <div className="mb-3">
                        <h4
                          className={`text-sm font-medium mb-2 ${
                            isDark ? "text-green-300" : "text-green-600"
                          }`}
                        >
                          Faktor Positif ✓
                        </h4>
                        <ul className="space-y-1">
                          {creditScore.factors.positive.map((factor, index) => (
                            <li
                              key={index}
                              className={`text-xs ${
                                isDark ? "text-green-200" : "text-green-700"
                              }`}
                            >
                              • {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {creditScore?.factors.negative &&
                    creditScore.factors.negative.length > 0 && (
                      <div>
                        <h4
                          className={`text-sm font-medium mb-2 ${
                            isDark ? "text-red-300" : "text-red-600"
                          }`}
                        >
                          Faktor Negatif ⚠️
                        </h4>
                        <ul className="space-y-1">
                          {creditScore.factors.negative.map((factor, index) => (
                            <li
                              key={index}
                              className={`text-xs ${
                                isDark ? "text-red-200" : "text-red-700"
                              }`}
                            >
                              • {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  className={`text-center p-4 rounded-lg ${
                    isDark
                      ? "bg-blue-900/20 border border-blue-800/30"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${
                      isDark ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    {stats?.totalSewa || 0}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-blue-200" : "text-blue-700"
                    }`}
                  >
                    Total Sewa
                  </div>
                </div>

                <div
                  className={`text-center p-4 rounded-lg ${
                    isDark
                      ? "bg-green-900/20 border border-green-800/30"
                      : "bg-green-50 border border-green-200"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${
                      isDark ? "text-green-300" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(stats?.totalPendapatan || 0)}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-green-200" : "text-green-700"
                    }`}
                  >
                    Total Pendapatan
                  </div>
                </div>

                <div
                  className={`text-center p-4 rounded-lg ${
                    isDark
                      ? "bg-red-900/20 border border-red-800/30"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${
                      isDark ? "text-red-300" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(stats?.totalDenda || 0)}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-red-200" : "text-red-700"
                    }`}
                  >
                    Total Denda
                  </div>
                </div>

                <div
                  className={`text-center p-4 rounded-lg ${
                    isDark
                      ? "bg-yellow-900/20 border border-yellow-800/30"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${
                      isDark ? "text-yellow-300" : "text-yellow-600"
                    }`}
                  >
                    {stats?.sewaDenda || 0}
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-yellow-200" : "text-yellow-700"
                    }`}
                  >
                    Sewa Kena Denda
                  </div>
                </div>

                <div
                  className={`text-center p-4 rounded-lg ${
                    isDark
                      ? "bg-purple-900/20 border border-purple-800/30"
                      : "bg-purple-50 border border-purple-200"
                  }`}
                >
                  <div
                    className={`text-xl font-bold ${
                      isDark ? "text-purple-300" : "text-purple-600"
                    }`}
                  >
                    {stats?.sewaSelesai || 0}
                  </div>
                  <div
                    className={`text-xs ${
                      isDark ? "text-purple-200" : "text-purple-700"
                    }`}
                  >
                    Sewa Selesai
                  </div>
                </div>

                <div
                  className={`text-center p-4 rounded-lg ${
                    isDark
                      ? "bg-orange-900/20 border border-orange-800/30"
                      : "bg-orange-50 border border-orange-200"
                  }`}
                >
                  <div
                    className={`text-xl font-bold ${
                      isDark ? "text-orange-300" : "text-orange-600"
                    }`}
                  >
                    {formatKeterlambatan(stats?.keterlambatanTotal || 0)}
                  </div>
                  <div
                    className={`text-xs ${
                      isDark ? "text-orange-200" : "text-orange-700"
                    }`}
                  >
                    Total Keterlambatan
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div
                className={`mt-4 p-4 rounded-lg ${
                  isDark
                    ? "bg-dark-secondary/50 border border-dark-border"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <h4
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-dark-primary" : "text-gray-900"
                  }`}
                >
                  📊 Analisis Credit Score
                </h4>
                <p
                  className={`text-xs ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  Skor dihitung berdasarkan: tingkat penyelesaian sewa (
                  {Math.round(
                    ((stats?.sewaSelesai || 0) / (stats?.totalSewa || 1)) * 100
                  )}
                  %), keterlambatan pengembalian ({stats?.sewaDenda || 0} sewa),
                  dan total denda ({formatCurrency(stats?.totalDenda || 0)}).
                  Skor yang lebih tinggi menunjukkan penyewa yang lebih
                  terpercaya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Sewa Table */}
      <div
        className={`rm-card ${
          isDark
            ? "bg-dark-card border-dark-border"
            : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`px-6 py-4 border-b ${
            isDark ? "border-dark-border" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Riwayat Sewa Detail
          </h2>
        </div>
        <div className="p-6">
          {isHistoryLoading ? (
            <div className="flex justify-center items-center py-8">
              <div
                className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                  isDark ? "border-blue-400" : "border-blue-600"
                }`}
              ></div>
            </div>
          ) : historySewa.length === 0 ? (
            <div
              className={`text-center py-8 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              <svg
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>Belum ada riwayat sewa</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${
                      isDark ? "border-dark-border" : "border-gray-200"
                    }`}
                  >
                    <th
                      className={`text-left py-3 px-4 text-sm font-medium ${
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      }`}
                    >
                      Plat Motor
                    </th>
                    <th
                      className={`text-left py-3 px-4 text-sm font-medium ${
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      }`}
                    >
                      Periode Sewa
                    </th>
                    <th
                      className={`text-left py-3 px-4 text-sm font-medium ${
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      }`}
                    >
                      Harga
                    </th>
                    <th
                      className={`text-left py-3 px-4 text-sm font-medium ${
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      }`}
                    >
                      Denda
                    </th>
                    <th
                      className={`text-left py-3 px-4 text-sm font-medium ${
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      }`}
                    >
                      Keterlambatan
                    </th>
                    <th
                      className={`text-left py-3 px-4 text-sm font-medium ${
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      }`}
                    >
                      Status
                    </th>
                    <th
                      className={`text-left py-3 px-4 text-sm font-medium ${
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      }`}
                    >
                      Selesai
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historySewa.map((history) => (
                    <tr
                      key={history.id}
                      className={`border-b ${
                        isDark
                          ? "border-dark-border hover:bg-dark-secondary/50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div
                            className={`font-medium ${
                              isDark ? "text-dark-primary" : "text-gray-900"
                            }`}
                          >
                            {history.motor_plat}
                          </div>
                          <div
                            className={`text-sm ${
                              isDark ? "text-dark-muted" : "text-gray-500"
                            }`}
                          >
                            {history.motor_merk} {history.motor_model}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`text-sm ${
                            isDark ? "text-dark-primary" : "text-gray-900"
                          }`}
                        >
                          {formatDate(history.tgl_sewa)}
                        </div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-dark-muted" : "text-gray-500"
                          }`}
                        >
                          sampai {formatDate(history.tgl_kembali)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`font-medium ${
                            isDark ? "text-dark-primary" : "text-gray-900"
                          }`}
                        >
                          {formatCurrency(history.harga)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`font-medium ${
                            history.denda > 0
                              ? isDark
                                ? "text-red-300"
                                : "text-red-600"
                              : isDark
                              ? "text-dark-muted"
                              : "text-gray-500"
                          }`}
                        >
                          {history.denda > 0
                            ? formatCurrency(history.denda)
                            : "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`text-sm ${
                            history.keterlambatan_menit &&
                            history.keterlambatan_menit > 0
                              ? isDark
                                ? "text-orange-300"
                                : "text-orange-600"
                              : isDark
                              ? "text-dark-muted"
                              : "text-gray-500"
                          }`}
                        >
                          {formatKeterlambatan(
                            history.keterlambatan_menit || 0
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            history.status_selesai === "Selesai"
                              ? isDark
                                ? "bg-green-900/20 text-green-300"
                                : "bg-green-100 text-green-800"
                              : isDark
                              ? "bg-yellow-900/20 text-yellow-300"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {history.status_selesai}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`text-sm ${
                            isDark ? "text-dark-primary" : "text-gray-900"
                          }`}
                        >
                          {formatDate(history.tgl_selesai)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
