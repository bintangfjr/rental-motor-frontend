import React from "react";
import { Sewa } from "../../types/sewa";
import { useTheme } from "../../hooks/useTheme";

interface AdditionalCostItem {
  description: string;
  amount: number;
  type: "discount" | "additional";
}

interface RentalSummaryProps {
  tglSewa: string;
  tglKembali: string;
  selectedMotor?: {
    harga: number;
  };
  additionalCosts: AdditionalCostItem[];
  currentSewa?: Sewa;
}

const RentalSummary: React.FC<RentalSummaryProps> = ({
  tglSewa,
  tglKembali,
  selectedMotor,
  additionalCosts,
  currentSewa,
}) => {
  const { isDark } = useTheme();

  const calculateDurasi = () => {
    if (!tglSewa || !tglKembali) return 0;
    const start = new Date(tglSewa);
    const end = new Date(tglKembali);
    const diffMs = end.getTime() - start.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const calculateBaseHarga = () => {
    const durasi = calculateDurasi();
    return durasi * (selectedMotor?.harga || 0);
  };

  const calculateAdditionalCostsTotal = () => {
    if (!additionalCosts.length) return 0;

    return additionalCosts.reduce((total, cost) => {
      if (cost.type === "discount") {
        return total - cost.amount; // ✅ DISCOUNT mengurangi total
      } else {
        return total + cost.amount; // ✅ ADDITIONAL menambah total
      }
    }, 0);
  };

  const calculateTotalHarga = () => {
    const baseHarga = calculateBaseHarga();
    const additionalCostsTotal = calculateAdditionalCostsTotal();
    return Math.max(0, baseHarga + additionalCostsTotal);
  };

  const durasi = calculateDurasi();
  const baseHarga = calculateBaseHarga();
  const additionalCostsTotal = calculateAdditionalCostsTotal();
  const totalHarga = calculateTotalHarga();

  return (
    <div
      className={`rm-card p-4 rounded-lg ${
        isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
      } border`}
    >
      <h3
        className={`font-semibold mb-2 ${
          isDark ? "text-blue-300" : "text-blue-800"
        }`}
      >
        Rincian Sewa
      </h3>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className={isDark ? "text-dark-secondary" : "text-gray-600"}>
          Durasi:
        </span>
        <span
          className={`font-medium ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          {durasi} hari
        </span>

        <span className={isDark ? "text-dark-secondary" : "text-gray-600"}>
          Harga per Hari:
        </span>
        <span
          className={`font-medium ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          Rp {selectedMotor?.harga?.toLocaleString()}
        </span>

        <span className={isDark ? "text-dark-secondary" : "text-gray-600"}>
          Biaya Dasar ({durasi} hari):
        </span>
        <span
          className={`font-medium ${
            isDark ? "text-dark-primary" : "text-gray-900"
          }`}
        >
          Rp {baseHarga.toLocaleString()}
        </span>

        {/* ✅ Breakdown Additional Costs */}
        {additionalCosts.map((cost, index) => {
          const isDiscount = cost.type === "discount";
          const sign = isDiscount ? "-" : "+";
          const textColor = isDiscount
            ? isDark
              ? "text-green-400"
              : "text-green-600"
            : isDark
            ? "text-blue-400"
            : "text-blue-600";

          return (
            <React.Fragment key={index}>
              <span className={textColor}>
                {isDiscount ? "Potongan" : "Biaya Tambahan"}: {cost.description}
              </span>
              <span className={`font-medium ${textColor}`}>
                {sign} Rp {cost.amount.toLocaleString()}
              </span>
            </React.Fragment>
          );
        })}

        {/* ✅ Total Additional Costs */}
        {additionalCosts.length > 0 && (
          <>
            <span
              className={`font-medium ${
                isDark ? "text-dark-primary" : "text-gray-900"
              }`}
            >
              Total Biaya Tambahan/Potongan:
            </span>
            <span
              className={`font-medium ${
                additionalCostsTotal >= 0
                  ? isDark
                    ? "text-blue-400"
                    : "text-blue-600"
                  : isDark
                  ? "text-green-400"
                  : "text-green-600"
              }`}
            >
              {additionalCostsTotal >= 0 ? "+" : ""}Rp{" "}
              {Math.abs(additionalCostsTotal).toLocaleString()}
            </span>
          </>
        )}

        <span
          className={`font-semibold border-t pt-1 ${
            isDark
              ? "text-dark-primary border-dark-border"
              : "text-gray-900 border-gray-200"
          }`}
        >
          Total Harga:
        </span>
        <span
          className={`font-semibold text-lg border-t pt-1 ${
            isDark
              ? "text-green-400 border-dark-border"
              : "text-green-600 border-gray-200"
          }`}
        >
          Rp {totalHarga.toLocaleString()}
        </span>

        {/* ✅ Perbandingan Harga (untuk edit mode) */}
        {currentSewa && totalHarga !== currentSewa.total_harga && (
          <>
            <span className={isDark ? "text-dark-muted" : "text-gray-500"}>
              Harga Sebelumnya:
            </span>
            <span
              className={`line-through ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              Rp {currentSewa.total_harga.toLocaleString()}
            </span>

            <span className={isDark ? "text-blue-400" : "text-blue-600"}>
              Selisih:
            </span>
            <span
              className={`font-medium ${
                totalHarga > currentSewa.total_harga
                  ? isDark
                    ? "text-green-400"
                    : "text-green-600"
                  : isDark
                  ? "text-red-400"
                  : "text-red-600"
              }`}
            >
              {totalHarga > currentSewa.total_harga ? "+" : ""}
              Rp{" "}
              {Math.abs(totalHarga - currentSewa.total_harga).toLocaleString()}
            </span>
          </>
        )}
      </div>

      {/* ✅ Debug Info (bisa dihapus setelah testing) */}
      {import.meta.env.MODE === "development" && (
        <div
          className={`mt-4 p-2 rounded text-xs ${
            isDark
              ? "bg-dark-secondary/30 text-dark-muted"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <p>
            <strong>Debug Info:</strong>
          </p>
          <p>Items: {additionalCosts.length}</p>
          <p>
            Additional:{" "}
            {additionalCosts.filter((c) => c.type === "additional").length}
          </p>
          <p>
            Discount:{" "}
            {additionalCosts.filter((c) => c.type === "discount").length}
          </p>
        </div>
      )}
    </div>
  );
};

export default RentalSummary;
