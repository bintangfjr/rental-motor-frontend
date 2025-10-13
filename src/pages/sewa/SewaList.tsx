import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { sewaService } from "../../services/sewaService";
import { Sewa } from "../../types/sewa";
import { Button } from "../../components/ui/Button";
import { DataTable, Column } from "../../components/ui/DataTable";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../utils/formatters";

const SewaList: React.FC = () => {
  const [sewas, setSewas] = useState<Sewa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSewas = async () => {
    try {
      setIsLoading(true);
      const data = await sewaService.getAll();
      setSewas(data);
      setError(null);
    } catch (err) {
      setError("Gagal memuat data sewa");
      console.error("Error loading sewas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSewas();
  }, []);

  const handleSelesai = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menyelesaikan sewa ini?")) {
      return;
    }

    try {
      await sewaService.selesai(id, {
        tgl_selesai: new Date().toISOString(),
        catatan: "Selesai dari daftar sewa",
      });
      alert("Sewa berhasil diselesaikan");
      loadSewas();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyelesaikan sewa";
      alert(errorMessage);
    }
  };

  // ✅ PERBAIKAN: Handle both string and Date types
  const calculateRemainingTime = (tglKembali: string | Date): string => {
    try {
      const end =
        tglKembali instanceof Date ? tglKembali : new Date(tglKembali);
      const now = new Date();

      // Jika tanggal kembali invalid
      if (isNaN(end.getTime())) return "-";

      const sisaWaktuMs = end.getTime() - now.getTime();

      // Jika sudah lewat tempo
      if (sisaWaktuMs <= 0) {
        const overdueMs = Math.abs(sisaWaktuMs);
        const daysOverdue = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
        const hoursOverdue = Math.floor(
          (overdueMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );

        if (daysOverdue > 0) {
          return `+${daysOverdue}h ${hoursOverdue}j`;
        }
        return `+${hoursOverdue}j`;
      }

      // Hitung sisa waktu
      const days = Math.floor(sisaWaktuMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (sisaWaktuMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (sisaWaktuMs % (1000 * 60 * 60)) / (1000 * 60)
      );

      if (days > 0) {
        return `${days}h ${hours}j`;
      } else if (hours > 0) {
        return `${hours}j ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      console.error("Error calculating remaining time:", error);
      return "-";
    }
  };

  // ✅ PERBAIKAN: Handle both string and Date types
  const getStatusBadge = (status: string, tglKembali: string | Date) => {
    // Cek dulu status dari backend
    if (status === "selesai") {
      return <Badge variant="success">Selesai</Badge>;
    }
    if (status === "dibatalkan") {
      return <Badge variant="secondary">Dibatalkan</Badge>;
    }

    // Untuk status aktif, cek apakah lewat tempo
    try {
      const end =
        tglKembali instanceof Date ? tglKembali : new Date(tglKembali);
      const now = new Date();
      if (end < now) {
        return <Badge variant="danger">Lewat Tempo</Badge>;
      }
      return <Badge variant="warning">Aktif</Badge>;
    } catch {
      return <Badge variant="warning">Aktif</Badge>;
    }
  };

  // ✅ PERBAIKAN: Helper function untuk convert ke string date
  const safeFormatDate = (
    dateValue: string | Date | null | undefined
  ): string => {
    if (!dateValue) return "-";
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return isNaN(date.getTime()) ? "-" : formatDate(date);
    } catch {
      return "-";
    }
  };

  const columns: Column<Sewa>[] = [
    {
      key: "motor",
      header: "Motor",
      render: (_, row) =>
        row.motor
          ? `${row.motor.merk} ${row.motor.model} (${row.motor.plat_nomor})`
          : "-",
    },
    {
      key: "penyewa",
      header: "Penyewa",
      render: (_, row) => row.penyewa?.nama ?? "-",
    },
    {
      key: "tgl_sewa",
      header: "Tanggal Sewa",
      render: (value) => safeFormatDate(value as string | Date),
    },
    {
      key: "tgl_kembali",
      header: "Tanggal Kembali",
      render: (value) => safeFormatDate(value as string | Date),
    },
    {
      key: "sisa_waktu",
      header: "Sisa Waktu",
      render: (_, row) => {
        // ✅ PERBAIKAN: Hanya hitung untuk sewa aktif
        if (row.status !== "aktif" || !row.tgl_kembali) {
          return "-";
        }
        return calculateRemainingTime(row.tgl_kembali);
      },
    },
    {
      key: "total_harga",
      header: "Total Harga",
      render: (value) =>
        typeof value === "number" ? formatCurrency(value) : "-",
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => {
        if (!row.status || !row.tgl_kembali) return "-";
        return getStatusBadge(row.status, row.tgl_kembali);
      },
    },
    {
      key: "id",
      header: "Aksi",
      render: (id, row) => (
        <div className="flex space-x-2">
          <Link to={`/sewas/${id}`}>
            <Button size="sm" variant="outline">
              Detail
            </Button>
          </Link>
          {/* ✅ PERBAIKAN: Gunakan status lowercase seperti dari backend */}
          {row.status === "aktif" && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleSelesai(id as number)}
            >
              Selesai
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadSewas} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daftar Sewa</h1>
        <Link to="/sewas/create">
          <Button>Tambah Sewa</Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={sewas}
        searchable
        searchPlaceholder="Cari motor, penyewa..."
      />
    </div>
  );
};

export default SewaList;
