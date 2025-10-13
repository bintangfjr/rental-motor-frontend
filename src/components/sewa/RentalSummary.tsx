import React from "react";
import { Sewa } from "../../types/sewa";

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

  // ✅ Debug log untuk memeriksa data
  console.log("Additional Costs:", additionalCosts);
  console.log("Additional Costs Total:", additionalCostsTotal);
  console.log("Base Harga:", baseHarga);
  console.log("Total Harga:", totalHarga);

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-semibold text-blue-800 mb-2">Rincian Sewa</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span>Durasi:</span>
        <span className="font-medium">{durasi} hari</span>

        <span>Harga per Hari:</span>
        <span className="font-medium">
          Rp {selectedMotor?.harga?.toLocaleString()}
        </span>

        <span>Biaya Dasar ({durasi} hari):</span>
        <span className="font-medium">Rp {baseHarga.toLocaleString()}</span>

        {/* ✅ Breakdown Additional Costs */}
        {additionalCosts.map((cost, index) => {
          const isDiscount = cost.type === "discount";
          const sign = isDiscount ? "-" : "+";
          const textColor = isDiscount ? "text-green-600" : "text-blue-600";

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
            <span className="font-medium">Total Biaya Tambahan/Potongan:</span>
            <span
              className={`font-medium ${
                additionalCostsTotal >= 0 ? "text-blue-600" : "text-green-600"
              }`}
            >
              {additionalCostsTotal >= 0 ? "+" : ""}Rp{" "}
              {Math.abs(additionalCostsTotal).toLocaleString()}
            </span>
          </>
        )}

        <span className="font-semibold border-t pt-1">Total Harga:</span>
        <span className="font-semibold text-green-600 text-lg border-t pt-1">
          Rp {totalHarga.toLocaleString()}
        </span>

        {/* ✅ Perbandingan Harga (untuk edit mode) */}
        {currentSewa && totalHarga !== currentSewa.total_harga && (
          <>
            <span className="text-gray-500">Harga Sebelumnya:</span>
            <span className="text-gray-500 line-through">
              Rp {currentSewa.total_harga.toLocaleString()}
            </span>

            <span className="text-blue-600">Selisih:</span>
            <span
              className={`font-medium ${
                totalHarga > currentSewa.total_harga
                  ? "text-green-600"
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
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
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
