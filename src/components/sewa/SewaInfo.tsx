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
      className={`p-6 rounded-lg border space-y-6 ${
        isDark
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      {/* Status Sewa - DIUBAH: Gunakan h2 dengan styling yang sama */}
      <div className="flex justify-between items-center">
        <h2
          className={`text-xl font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Detail Sewa
        </h2>
        <Badge
          variant={
            sewa.status === "aktif"
              ? isLewatTempo
                ? "danger"
                : "warning"
              : "success"
          }
          className="text-base px-3 py-1" // DIUBAH: Sesuaikan ukuran badge
        >
          {sewa.status === "aktif" && isLewatTempo
            ? "LEWAT TEMPO"
            : sewa.status.toUpperCase()}
        </Badge>
      </div>

      {/* Grid Informasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informasi Sewa */}
        <div className="space-y-4">
          <h3
            className={`text-lg font-semibold border-b pb-2 ${
              isDark
                ? "border-gray-600 text-white"
                : "border-gray-200 text-gray-900"
            }`}
          >
            Informasi Sewa
          </h3>
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
          <h3
            className={`text-lg font-semibold border-b pb-2 ${
              isDark
                ? "border-gray-600 text-white"
                : "border-gray-200 text-gray-900"
            }`}
          >
            Pembayaran & Jaminan
          </h3>
          <InfoRow label="Metode Pembayaran" value={sewa.pembayaran || "-"} />
          <InfoRow
            label="Jaminan"
            value={
              jaminan.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {jaminan.map((item: string) => (
                    <Badge
                      key={item}
                      variant="default"
                      className="text-xs px-2 py-1"
                    >
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

      {/* Informasi Motor */}
      <div
        className={`pt-6 border-t ${
          isDark ? "border-gray-600" : "border-gray-200"
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-3 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Motor
        </h3>
        {sewa.motor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <InfoRow label="Plat Nomor" value={sewa.motor.plat_nomor} />
              <InfoRow label="Merk" value={sewa.motor.merk} />
              <InfoRow label="Model" value={sewa.motor.model} />
            </div>
            <div className="space-y-2">
              <InfoRow
                label="Tahun"
                value={sewa.motor.tahun?.toString() || "-"}
              />
              <InfoRow
                label="Harga per Hari"
                value={formatCurrency(sewa.motor.harga)}
              />
              <InfoRow
                label="Status Motor"
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
          </div>
        )}
      </div>

      {/* Informasi Penyewa */}
      <div
        className={`pt-6 border-t ${
          isDark ? "border-gray-600" : "border-gray-200"
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-3 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Penyewa
        </h3>
        {sewa.penyewa && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <InfoRow label="Nama" value={sewa.penyewa.nama} />
              <InfoRow
                label="WhatsApp"
                value={sewa.penyewa.no_whatsapp || "-"}
              />
            </div>
            <div className="space-y-2">
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
          </div>
        )}
      </div>

      {/* Riwayat Penyelesaian */}
      {sewa.histories && sewa.histories.length > 0 && (
        <div
          className={`pt-6 border-t ${
            isDark ? "border-gray-600" : "border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Riwayat Penyelesaian
          </h3>
          <div className="space-y-3">
            {sewa.histories.map((history) => (
              <div
                key={history.id}
                className={`p-4 rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`font-medium ${
                      isDark ? "text-white" : "text-gray-900"
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
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <InfoRow
                    label="Denda"
                    value={formatCurrency(history.denda)}
                  />
                  {history.keterlambatan_menit &&
                    history.keterlambatan_menit > 0 && (
                      <InfoRow
                        label="Keterlambatan"
                        value={`${Math.ceil(
                          history.keterlambatan_menit / 60
                        )} jam`}
                      />
                    )}
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
            ? "text-gray-400 border-gray-600"
            : "text-gray-500 border-gray-200"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Dibuat" value={formatDateTime(sewa.created_at)} />
          <InfoRow label="Diupdate" value={formatDateTime(sewa.updated_at)} />
        </div>
      </div>
    </div>
  );
};

// Komponen helper untuk baris informasi
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueClass = "" }) => {
  const { isDark } = useTheme();

  return (
    <div className="flex justify-between items-start">
      <span
        className={`font-medium flex-shrink-0 mr-4 ${
          isDark ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {label}:
      </span>
      <span
        className={`text-right break-words max-w-[60%] ${valueClass} ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

export default SewaInfo;
