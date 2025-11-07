import React from "react";
import { useTheme } from "../../../hooks/useTheme";

const EditModeInfo: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div
      className={`text-sm p-3 rounded-md border ${
        isDark
          ? "bg-yellow-900/20 text-yellow-200 border-yellow-800"
          : "bg-yellow-50 text-yellow-800 border-yellow-200"
      }`}
    >
      <p className="font-medium">Mode Edit:</p>
      <ul className="list-disc list-inside mt-1 space-y-1">
        <li>Motor dan Penyewa tidak dapat diubah</li>
        <li>Tanggal sewa tidak dapat diubah</li>
        <li>Ubah tanggal kembali untuk menyesuaikan durasi dan harga</li>
        <li>Tambahkan biaya tambahan atau potongan sesuai kebutuhan</li>
        <li>Catatan tambahan dapat diubah kapan saja</li>
      </ul>
    </div>
  );
};

export default EditModeInfo;
