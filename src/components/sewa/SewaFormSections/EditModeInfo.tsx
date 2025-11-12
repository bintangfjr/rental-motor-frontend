import React from "react";
import { useTheme } from "../../../hooks/useTheme";

const EditModeInfo: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div
      className={`text-sm p-4 rounded-lg border-2 ${
        isDark
          ? "bg-yellow-900/20 text-yellow-200 border-yellow-700"
          : "bg-yellow-50 text-yellow-800 border-yellow-300"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg mt-0.5">📝</span>
        <div>
          <p className="font-semibold mb-2">Mode Edit Aktif</p>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="text-xs">•</span>
              <span>Motor dan Penyewa tidak dapat diubah</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-xs">•</span>
              <span>Tanggal sewa tidak dapat diubah</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-xs">•</span>
              <span>
                Ubah tanggal kembali untuk menyesuaikan durasi dan harga
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-xs">•</span>
              <span>
                Tambahkan biaya tambahan atau potongan sesuai kebutuhan
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-xs">•</span>
              <span>Catatan tambahan dapat diubah kapan saja</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditModeInfo;
