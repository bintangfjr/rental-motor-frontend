import React, { lazy } from "react";
import { Button } from "../components/ui/Button";

const UnderMaintenance: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Sedang Dalam Perawatan
          </h1>
          <p className="text-gray-600">
            Sistem sedang dalam proses perawatan dan peningkatan. Kami akan
            segera kembali dengan pengalaman yang lebih baik.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800">
              <strong>Perkiraan Selesai:</strong> 2 Jam Lagi
            </p>
          </div>

          <Button onClick={() => window.location.reload()} className="w-full">
            Coba Lagi
          </Button>

          <div className="text-sm text-gray-500">
            <p>Terima kasih atas pengertiannya.</p>
            <p>Tim Teknisi Rental Motor</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderMaintenance;
