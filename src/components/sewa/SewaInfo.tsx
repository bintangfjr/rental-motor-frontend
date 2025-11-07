import React from "react";
import { Sewa } from "../../types/sewa";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { useTheme } from "../../hooks/useTheme";

interface SewaInfoProps {
  sewa: Sewa;
  isLewatTempo: boolean;
}

const SewaInfo: React.FC<SewaInfoProps> = ({ sewa, isLewatTempo }) => {
  const { isDark } = useTheme();

  const getJaminan = (): string[] => {
    if (!sewa.jaminan) return [];
    if (Array.isArray(sewa.jaminan)) return sewa.jaminan;
    if (typeof sewa.jaminan === "string") {
      try {
        return JSON.parse(sewa.jaminan);
      } catch {
        return sewa.jaminan
          .split(",")
          .map((item: string) => item.trim())
          .filter((item: string) => item);
      }
    }
    return [];
  };

  const jaminan = getJaminan();

  return (
    <div
      className={`rm-card p-6 space-y-6 ${
        isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-200"
      }`}
    >
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
          <h2
            className={`text-lg font-semibold border-b pb-2 ${
              isDark
                ? "text-dark-primary border-dark-border"
                : "text-gray-900 border-gray-200"
            }`}
          >
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
            valueClass={
              isDark
                ? "text-green-400 font-semibold"
                : "text-green-600 font-semibold"
            }
          />
          {sewa.admin && (
            <InfoRow label="Admin Input" value={sewa.admin.nama_lengkap} />
          )}
        </div>

        {/* Pembayaran & Jaminan */}
        <div className="space-y-4">
          <h2
            className={`text-lg font-semibold border-b pb-2 ${
              isDark
                ? "text-dark-primary border-dark-border"
                : "text-gray-900 border-gray-200"
            }`}
          >
            Pembayaran & Jaminan
          </h2>
          <InfoRow label="Metode Pembayaran" value={sewa.pembayaran || "-"} />
          <InfoRow
            label="Jaminan"
            value={
              jaminan.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {jaminan.map((item: string) => (
                    <Badge key={item} variant="default">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                "Tidak ada"
              )
            }
          />
        </div>
      </div>

      {/* Motor & Penyewa */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t ${
          isDark ? "border-dark-border" : "border-gray-200"
        }`}
      >
        <div>
          <h3
            className={`text-lg font-semibold mb-3 ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Motor
          </h3>
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
          <h3
            className={`text-lg font-semibold mb-3 ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Penyewa
          </h3>
          {sewa.penyewa && (
            <div className="space-y-2">
              <InfoRow label="Nama" value={sewa.penyewa.nama} />
              <InfoRow
                label="WhatsApp"
                value={sewa.penyewa.no_whatsapp || "-"}
              />
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
        <div
          className={`pt-6 border-t ${
            isDark ? "border-dark-border" : "border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Riwayat Penyelesaian
          </h3>
          <div className="space-y-3">
            {sewa.histories.map((history) => (
              <div
                key={history.id}
                className={`p-4 rounded-lg ${
                  isDark ? "bg-dark-secondary/50" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`font-medium ${
                      isDark ? "text-dark-primary" : "text-gray-900"
                    }`}
                  >
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
                <div
                  className={`text-sm space-y-1 ${
                    isDark ? "text-dark-secondary" : "text-gray-600"
                  }`}
                >
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
      <div
        className={`pt-6 border-t text-sm ${
          isDark
            ? "text-dark-muted border-dark-border"
            : "text-gray-500 border-gray-200"
        }`}
      >
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

const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueClass = "" }) => {
  const { isDark } = useTheme();

  return (
    <div className="flex justify-between">
      <span className={isDark ? "text-dark-secondary" : "text-gray-600"}>
        {label}:
      </span>
      <span
        className={`font-medium ${valueClass} ${
          isDark ? "text-dark-primary" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

export default SewaInfo;
