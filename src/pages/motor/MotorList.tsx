// src/pages/motor/MotorList.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motorService } from "../../services/motorService";
import { Motor } from "../../types/motor";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import Loading from "../../components/ui/Loading";
import { EmptyState } from "../../components/common/EmptyState";
import { DataTable, Column } from "../../components/ui/DataTable";
import { Card } from "../../components/ui/Card";
import { formatCurrency } from "../../utils/formatters";
import { AxiosError } from "axios"; // jika motorService pakai axios

const MotorList: React.FC = () => {
  const [motors, setMotors] = useState<Motor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadMotors = async () => {
    setIsLoading(true);
    try {
      const data: Motor[] = await motorService.getAll();
      setMotors(data);
      setError(null);
    } catch (err: unknown) {
      let message = "Gagal memuat data motor";
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      setError(message);
      console.error("Error loading motors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMotors();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus motor ini?")) return;

    try {
      await motorService.delete(id);
      setMotors((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      let message = "Gagal menghapus motor";
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      alert(message);
      console.error("Error deleting motor:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      "success" | "warning" | "danger" | "secondary"
    > = {
      tersedia: "success",
      disewa: "warning",
      perbaikan: "danger",
    };

    const statusLabels: Record<string, string> = {
      tersedia: "Tersedia",
      disewa: "Disewa",
      perbaikan: "Perbaikan",
    };

    return (
      <Badge variant={statusMap[status] || "secondary"}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  // Filter motors berdasarkan search query
  const filteredMotors = motors.filter(
    (motor) =>
      motor.plat_nomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      motor.merk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      motor.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      motor.tahun.toString().includes(searchQuery)
  );

  const columns: Column<Motor>[] = [
    { key: "plat_nomor", header: "Plat Nomor", sortable: true },
    { key: "merk", header: "Merk", sortable: true },
    { key: "model", header: "Model", sortable: true },
    { key: "tahun", header: "Tahun", sortable: true },
    {
      key: "harga",
      header: "Harga Sewa",
      render: (_, row) => formatCurrency(row.harga),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => getStatusBadge(row.status),
      sortable: true,
    },
    {
      key: "id",
      header: "Aksi",
      render: (_, row) => (
        <div className="flex space-x-2">
          <Link to={`/motors/${row.id}`}>
            <Button size="sm" variant="outline" title="Lihat Detail">
              Detail
            </Button>
          </Link>
          <Link to={`/motors/${row.id}/edit`}>
            <Button size="sm" variant="outline" title="Edit Motor">
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row.id)}
            title="Hapus Motor"
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  if (error)
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadMotors} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Daftar Motor</h1>
          <p className="text-gray-600">Total {filteredMotors.length} motor</p>
        </div>
        <Link to="/motors/create">
          <Button>+ Tambah Motor</Button>
        </Link>
      </div>

      <Card>
        {motors.length === 0 ? (
          <EmptyState
            title="Belum ada motor"
            description="Tambahkan motor pertama Anda untuk mulai mengelola rental."
            action={{
              label: "Tambah Motor",
              onClick: () => (window.location.href = "/motors/create"),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredMotors}
            search={{
              placeholder: "Cari plat nomor, merk, model, atau tahun...",
              onSearch: setSearchQuery,
            }}
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredMotors.length,
              onPageChange: (page, newSize) => {
                setCurrentPage(page);
                if (newSize) setPageSize(newSize);
              },
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default MotorList;
