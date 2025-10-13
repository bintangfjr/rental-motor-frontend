// src/pages/motor/MotorDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motorService } from "../../services/motorService";
import { Motor } from "../../types/motor";
import { Button } from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../utils/formatters";

const MotorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [motor, setMotor] = useState<Motor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMotor = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await motorService.getById(parseInt(id));
        setMotor(data);
      } catch (error: unknown) {
        console.error("Error loading motor:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMotor();
  }, [id]); // Hanya id sebagai dependency

  // Fungsi untuk menampilkan Badge dengan variant yang valid
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, React.ReactElement> = {
      tersedia: <Badge variant="success">Tersedia</Badge>,
      disewa: <Badge variant="warning">Disewa</Badge>,
      perbaikan: <Badge variant="danger">Perbaikan</Badge>,
    };

    return (
      statusMap[status.toLowerCase()] || (
        <Badge variant="secondary">{status}</Badge>
      )
    );
  };

  if (isLoading) return <Loading />;

  if (!motor) {
    return (
      <div className="text-center py-8">
        <p>Motor tidak ditemukan</p>
        <Link to="/motors">
          <Button className="mt-4">Kembali ke Daftar Motor</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/motors">
            <Button variant="outline">← Kembali</Button>
          </Link>
          <h1 className="text-2xl font-bold">Detail Motor</h1>
        </div>
        <Link to={`/motors/${motor.id}/edit`}>
          <Button>Edit Motor</Button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Informasi Motor</h2>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Plat Nomor:</span>
                <span className="font-medium">{motor.plat_nomor}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Merk:</span>
                <span className="font-medium">{motor.merk}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{motor.model}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tahun:</span>
                <span className="font-medium">{motor.tahun}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Harga Sewa per Hari:</span>
                <span className="font-medium">
                  {formatCurrency(motor.harga)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                {getStatusBadge(motor.status)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Informasi Teknis</h2>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Nomor GSM:</span>
                <span className="font-medium">{motor.no_gsm || "-"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">IMEI:</span>
                <span className="font-medium">{motor.imei || "-"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Device ID:</span>
                <span className="font-medium">{motor.device_id || "-"}</span>
              </div>

              {motor.lat && motor.lng && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Lokasi Terakhir:</span>
                  <span className="font-medium">
                    {motor.lat.toFixed(6)}, {motor.lng.toFixed(6)}
                  </span>
                </div>
              )}

              {motor.last_update && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Update Terakhir:</span>
                  <span className="font-medium">
                    {formatDate(motor.last_update)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h2 className="text-lg font-semibold mb-4">Riwayat Sewa</h2>

          {motor.sewas && motor.sewas.length > 0 ? (
            <div className="space-y-2">
              {motor.sewas.map((sewa) => (
                <div key={sewa.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {sewa.penyewa.nama} ({sewa.penyewa.no_whatsapp})
                    </span>
                    <Badge
                      variant={
                        sewa.status === "Aktif" ? "success" : "secondary"
                      }
                    >
                      {sewa.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Belum ada riwayat sewa</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotorDetail;
