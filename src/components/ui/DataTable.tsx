import React, { useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { Input } from "./Input";

export interface Column<T> {
  key: keyof T | string; // 🔑 fleksibel
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface PaginationProps {
  currentPage: number;                // halaman aktif
  pageSize: number;                   // jumlah item per halaman
  totalItems: number;                 // total semua data
  onPageChange: (page: number, pageSize: number) => void;
}

export interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: PaginationProps;

  // 🔎 mode 1: search internal
  searchable?: boolean;
  searchPlaceholder?: string;

  // 🔎 mode 2: search eksternal
  search?: SearchProps;

  // opsional untuk pesan kosong
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  pagination,
  searchable = false,
  searchPlaceholder = "Cari...",
  search,
  emptyMessage = "Tidak ada data",
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Sorting handler
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ✅ Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (search?.onSearch) {
      search.onSearch(query); // kirim ke parent kalau pakai search eksternal
    }
  };

  // ✅ Filtered data (hanya berlaku untuk search internal)
  const filteredData = useMemo(() => {
    if ((!searchable && !search) || !searchQuery) return data;

    const lowerQuery = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key as keyof T];
        return String(value ?? "").toLowerCase().includes(lowerQuery);
      })
    );
  }, [data, searchQuery, columns, searchable, search]);

  // ✅ Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // ✅ Apply pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    return sortedData.slice(startIndex, startIndex + pagination.pageSize);
  }, [sortedData, pagination]);

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Search */}
      {(searchable || search) && (
        <div className="p-4 border-b">
          <Input
            placeholder={search?.placeholder || searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.sortable && "cursor-pointer"
                  )}
                  onClick={() =>
                    column.sortable && handleSort(String(column.key))
                  }
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const rawValue = row[column.key as keyof T];
                    return (
                      <td
                        key={String(column.key)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column.render
                          ? column.render(rawValue, row)
                          : String(rawValue ?? "")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {pagination.currentPage} of{" "}
            {Math.ceil(pagination.totalItems / pagination.pageSize)}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() =>
                pagination.onPageChange(
                  pagination.currentPage - 1,
                  pagination.pageSize
                )
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                pagination.currentPage ===
                Math.ceil(pagination.totalItems / pagination.pageSize)
              }
              onClick={() =>
                pagination.onPageChange(
                  pagination.currentPage + 1,
                  pagination.pageSize
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
