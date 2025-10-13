// src/pages/penyewa/PenyewaList.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { penyewaService } from "../../services/penyewaService";
import { Penyewa } from "../../types/penyewa";
import { Button } from "../../components/ui/Button";
import { DataTable, Column } from "../../components/ui/DataTable";
import { Badge } from "../../components/ui/Badge";
import Loading from "../../components/ui/Loading";
import { EmptyState } from "../../components/common/EmptyState";
import { formatPhoneNumber, formatDate } from "../../utils/formatters";

export const PenyewaList: React.FC = () => {
  const [penyewas, setPenyewas] = useState<Penyewa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPenyewas = async () => {
    try {
      setIsLoading(true);
      const data = await penyewaService.getAll();
      setPenyewas(data);
      setError(null);
    } catch (err: unknown) {
      setError("Gagal memuat data penyewa");
      console.error("Error loading penyewas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPenyewas();
  }, []);

  const handleToggleBlacklist = async (id: string) => {
    // Ubah parameter ke string
    try {
      const updatedPenyewa = await penyewaService.toggleBlacklist(id);
      setPenyewas(penyewas.map((p) => (p.id === id ? updatedPenyewa : p)));
    } catch (error: unknown) {
      console.error("Error toggling blacklist:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengubah status blacklist";
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    // Ubah parameter ke string
    if (!window.confirm("Apakah Anda yakin ingin menghapus penyewa ini?"))
      return;

    try {
      await penyewaService.delete(id);
      setPenyewas(penyewas.filter((p) => p.id !== id));
    } catch (error: unknown) {
      console.error("Error deleting penyewa:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus penyewa";

      // Jika error 404, tetap hapus dari state (data konsisten)
      if (error instanceof Error && error.message.includes("404")) {
        setPenyewas(penyewas.filter((p) => p.id !== id));
        alert("Data sudah dihapus dari sistem");
      } else {
        alert(errorMessage);
      }
    }
  };

  const getBlacklistBadge = (isBlacklisted: boolean) => {
    return isBlacklisted ? (
      <Badge variant="danger">Blacklist</Badge>
    ) : (
      <Badge variant="success">Aman</Badge>
    );
  };

  const columns: Column<Penyewa>[] = [
    {
      key: "nama",
      header: "Nama",
    },
    {
      key: "no_whatsapp",
      header: "WhatsApp",
      render: (_, row) => formatPhoneNumber(row.no_whatsapp),
    },
    {
      key: "is_blacklisted",
      header: "Status",
      render: (_, row) => getBlacklistBadge(row.is_blacklisted),
    },
    {
      key: "created_at",
      header: "Tanggal Daftar",
      render: (_, row) => formatDate(row.created_at),
    },
    {
      key: "id",
      header: "Aksi",
      render: (_, row) => (
        <div className="flex space-x-2">
          <Link to={`/penyewas/${row.id}`}>
            <Button size="sm" variant="outline">
              Detail
            </Button>
          </Link>
          <Link to={`/penyewas/${row.id}/edit`}>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant={row.is_blacklisted ? "success" : "danger"}
            onClick={() => handleToggleBlacklist(row.id)}
          >
            {row.is_blacklisted ? "Buka Blacklist" : "Blacklist"}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row.id)}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadPenyewas} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daftar Penyewa</h1>
        <Link to="/penyewas/create">
          <Button>Tambah Penyewa</Button>
        </Link>
      </div>

      {penyewas.length === 0 ? (
        <EmptyState
          title="Belum ada penyewa"
          description="Tambahkan penyewa pertama Anda untuk mulai mengelola rental."
          action={{
            label: "Tambah Penyewa",
            onClick: () => (window.location.href = "/penyewas/create"),
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={penyewas}
          search={{
            placeholder: "Cari penyewa...",
            onSearch: (query) => {
              // Implementasi pencarian
              const filtered = penyewas.filter(
                (penyewa) =>
                  penyewa.nama.toLowerCase().includes(query.toLowerCase()) ||
                  penyewa.no_whatsapp.includes(query)
              );
              setPenyewas(filtered);
              if (query === "") loadPenyewas(); // Reset jika query kosong
            },
          }}
        />
      )}
    </div>
  );
};

export default PenyewaList;
