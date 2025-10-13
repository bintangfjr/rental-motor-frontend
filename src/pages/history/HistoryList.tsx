import React, { useState, useEffect, FormEvent } from "react";
import { historyService } from "../../services/historyService";
import { History } from "../../types/history";
import { Button } from "../../components/ui/Button";
import { DataTable, Column } from "../../components/ui/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { Input } from "../../components/ui/Input";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { AxiosError } from "axios"; // Jika historyService pakai axios

const HistoryList: React.FC = () => {
  const [histories, setHistories] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const loadHistories = async (page: number = 1, searchTerm: string = "") => {
    try {
      setIsLoading(true);
      const response = await historyService.getAll(
        page,
        pagination.limit,
        searchTerm
      );
      setHistories(response.data);
      setPagination(response.pagination);
    } catch (err: unknown) {
      console.error("Error loading histories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    loadHistories(1, search);
  };

  const handlePageChange = (page: number) => {
    loadHistories(page, search);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat ini?"))
      return;

    try {
      await historyService.delete(id);
      loadHistories(pagination.page, search);
    } catch (err: unknown) {
      // Tangani error dengan aman
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || "Gagal menghapus riwayat");
      } else if (err instanceof Error) {
        alert(err.message || "Gagal menghapus riwayat");
      } else {
        alert("Gagal menghapus riwayat");
      }
    }
  };

  const getStatusBadge = (status: string) =>
    status === "Tepat Waktu" ? (
      <Badge variant="success">Tepat Waktu</Badge>
    ) : (
      <Badge variant="danger">Terlambat</Badge>
    );

  const columns: Column<History>[] = [
    {
      key: "motor",
      header: "Motor",
      render: (_, row) =>
        row.sewa
          ? `${row.sewa.motor.merk} ${row.sewa.motor.model} (${row.sewa.motor.plat_nomor})`
          : "-",
    },
    {
      key: "penyewa",
      header: "Penyewa",
      render: (_, row) => row.sewa?.penyewa?.nama ?? "-",
    },
    {
      key: "tgl_selesai",
      header: "Tanggal Selesai",
      render: (value) => (value ? formatDate(value as Date) : "-"),
    },
    {
      key: "status_selesai",
      header: "Status",
      render: (value) => getStatusBadge(value as string),
    },
    {
      key: "harga",
      header: "Harga Sewa",
      render: (value) => formatCurrency(value as number),
    },
    {
      key: "denda",
      header: "Denda",
      render: (value) => formatCurrency(value as number),
    },
    {
      key: "total",
      header: "Total",
      render: (_, row) => formatCurrency((row.harga ?? 0) + (row.denda ?? 0)),
    },
    {
      key: "aksi",
      header: "Aksi",
      render: (_, row) => (
        <div className="flex space-x-2">
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Riwayat Sewa</h1>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex space-x-4">
        <Input
          type="text"
          placeholder="Cari berdasarkan plat nomor, nama penyewa, atau status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Cari</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSearch("");
            loadHistories(1, "");
          }}
        >
          Reset
        </Button>
      </form>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">
            {pagination.total}
          </h3>
          <p className="text-blue-600">Total Riwayat</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">
            {histories.filter((h) => h.status_selesai === "Tepat Waktu").length}
          </h3>
          <p className="text-green-600">Tepat Waktu</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">
            {histories.filter((h) => h.status_selesai === "Terlambat").length}
          </h3>
          <p className="text-red-600">Terlambat</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">
            {formatCurrency(
              histories.reduce(
                (sum, h) => sum + (h.harga ?? 0) + (h.denda ?? 0),
                0
              )
            )}
          </h3>
          <p className="text-purple-600">Total Pendapatan</p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={histories} isLoading={isLoading} />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default HistoryList;
