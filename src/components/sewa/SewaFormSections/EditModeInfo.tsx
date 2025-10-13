import React from "react";

const EditModeInfo: React.FC = () => (
  <div className="text-sm text-gray-500 p-3 bg-yellow-50 rounded-md">
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

export default EditModeInfo;
