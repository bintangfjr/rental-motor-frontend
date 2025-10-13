import React from "react";
import { Sewa } from "../../types/sewa";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

interface SewaInfoProps {
  sewa: Sewa;
  isLewatTempo: boolean;
}

const SewaInfo: React.FC<SewaInfoProps> = ({ sewa, isLewatTempo }) => {
  const getJaminan = (): string[] => {
    if (!sewa.jaminan) return [];
    if (Array.isArray(sewa.jaminan)) return sewa.jaminan;
    if (typeof sewa.jaminan === "string") {
      try {
        return JSON.parse(sewa.jaminan);
      } catch {
        return sewa.jaminan
          .split(",")
          .map((item: string) => item.trim()) // ✅ PERBAIKAN: Type annotation
          .filter((item: string) => item); // ✅ PERBAIKAN: Type annotation
      }
    }
    return [];
  };

  const jaminan = getJaminan();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
      {/* Status */}
      <Badge
        variant={
          sewa.status === "aktif"
            ? isLewatTempo
              ? "danger"
              : "warning"
            : "success"
        }
        className="text-lg"
      >
        {sewa.status}
        {isLewatTempo && " (Lewat Tempo)"}
      </Badge>

      {/* Grid Informasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informasi Sewa */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">
            Informasi Sewa
          </h2>
          <InfoRow label="Tanggal Sewa" value={formatDateTime(sewa.tgl_sewa)} />
          <InfoRow
            label="Tanggal Kembali"
            value={formatDateTime(sewa.tgl_kembali)}
          />
          <InfoRow
            label="Durasi"
            value={`${sewa.durasi_sewa} ${sewa.satuan_durasi}`}
          />
          <InfoRow
            label="Total Harga"
            value={formatCurrency(sewa.total_harga)}
            valueClass="text-green-600 font-semibold"
          />
          {sewa.admin && (
            <InfoRow label="Admin Input" value={sewa.admin.nama_lengkap} />
          )}
        </div>

        {/* Pembayaran & Jaminan */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">
            Pembayaran & Jaminan
          </h2>
          <InfoRow label="Metode Pembayaran" value={sewa.pembayaran || "-"} />
          <InfoRow
            label="Jaminan"
            value={
              jaminan.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {jaminan.map(
                    (
                      item: string // ✅ PERBAIKAN: Type annotation
                    ) => (
                      <Badge key={item} variant="default">
                        {item}
                      </Badge>
                    )
                  )}
                </div>
              ) : (
                "Tidak ada"
              )
            }
          />
        </div>
      </div>

      {/* Motor & Penyewa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
        <div>
          <h3 className="text-lg font-semibold mb-3">Motor</h3>
          {sewa.motor && (
            <div className="space-y-2">
              <InfoRow label="Plat" value={sewa.motor.plat_nomor} />
              <InfoRow
                label="Merk/Model"
                value={`${sewa.motor.merk} ${sewa.motor.model}`}
              />
              <InfoRow
                label="Harga/Hari"
                value={formatCurrency(sewa.motor.harga)}
              />
              <InfoRow
                label="Status"
                value={
                  <Badge
                    variant={
                      sewa.motor.status === "tersedia" ? "success" : "warning"
                    }
                  >
                    {sewa.motor.status}
                  </Badge>
                }
              />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Penyewa</h3>
          {sewa.penyewa && (
            <div className="space-y-2">
              <InfoRow label="Nama" value={sewa.penyewa.nama} />
              <InfoRow
                label="WhatsApp"
                value={sewa.penyewa.no_whatsapp || "-"}
              />
              {/* ✅ PERBAIKAN: alamat sekarang ada di type */}
              {sewa.penyewa.alamat && (
                <InfoRow label="Alamat" value={sewa.penyewa.alamat} />
              )}
              <InfoRow
                label="Status"
                value={
                  <Badge
                    variant={sewa.penyewa.is_blacklisted ? "danger" : "success"}
                  >
                    {sewa.penyewa.is_blacklisted ? "Blacklisted" : "Aktif"}
                  </Badge>
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Riwayat */}
      {sewa.histories && sewa.histories.length > 0 && (
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Riwayat Penyelesaian</h3>
          <div className="space-y-3">
            {sewa.histories.map((history) => (
              <div key={history.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">
                    {formatDateTime(history.tgl_selesai)}
                  </span>
                  <Badge
                    variant={
                      history.status_selesai === "Tepat Waktu"
                        ? "success"
                        : "danger"
                    }
                  >
                    {history.status_selesai}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <InfoRow
                    label="Denda"
                    value={formatCurrency(history.denda)}
                  />
                  <InfoRow label="Catatan" value={history.catatan || "-"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="pt-6 border-t text-sm text-gray-500">
        <InfoRow label="Dibuat" value={formatDateTime(sewa.created_at)} />
        <InfoRow label="Diupdate" value={formatDateTime(sewa.updated_at)} />
      </div>
    </div>
  );
};

// Komponen helper
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueClass = "" }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className={`font-medium ${valueClass}`}>{value}</span>
  </div>
);

export default SewaInfo;
