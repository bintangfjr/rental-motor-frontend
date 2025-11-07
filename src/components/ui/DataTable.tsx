import React, { useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { Input } from "./Input";
import { useTheme } from "../../hooks/useTheme";

// Generic type yang lebih fleksibel
export interface Column<T = any> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number, pageSize?: number) => void;
}

export interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: PaginationProps;
  searchable?: boolean;
  searchPlaceholder?: string;
  search?: SearchProps;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T = any>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  pagination,
  searchable = false,
  searchPlaceholder = "Cari...",
  search,
  emptyMessage = "Tidak ada data",
  className,
}: DataTableProps<T>) {
  const { isDark } = useTheme();
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (search?.onSearch) search.onSearch(query);
  };

  const filteredData = useMemo(() => {
    if ((!searchable && !search) || !searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = (row as any)[col.key];
        return String(value ?? "")
          .toLowerCase()
          .includes(lowerQuery);
      })
    );
  }, [data, searchQuery, columns, searchable, search]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    return sortedData.slice(startIndex, startIndex + pagination.pageSize);
  }, [sortedData, pagination]);

  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.pageSize)
    : 0;

  if (isLoading) {
    return (
      <div
        className={`flex justify-center items-center h-64 ${
          isDark ? "bg-dark-card" : "bg-white"
        } rounded-lg`}
      >
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? "border-blue-400" : "border-blue-600"
          }`}
        ></div>
      </div>
    );
  }

  const tableContainerClasses = cn(
    "rm-card rounded-lg overflow-hidden transition-colors duration-200",
    isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-200",
    className
  );

  const tableHeaderClasses = cn(
    "text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200",
    isDark
      ? "bg-dark-secondary text-dark-secondary border-dark-border"
      : "bg-gray-50 text-gray-500 border-gray-200"
  );

  const tableRowClasses = (onClick?: boolean) =>
    cn(
      "transition-colors duration-150",
      isDark
        ? "border-dark-border hover:bg-dark-hover"
        : "border-gray-200 hover:bg-gray-50",
      onClick && "cursor-pointer"
    );

  const tableCellClasses = cn(
    "px-6 py-4 whitespace-nowrap text-sm transition-colors duration-200",
    isDark ? "text-dark-primary" : "text-gray-900"
  );

  return (
    <div className={tableContainerClasses}>
      {(searchable || search) && (
        <div
          className={`p-4 border-b ${
            isDark ? "border-dark-border" : "border-gray-200"
          }`}
        >
          <Input
            placeholder={search?.placeholder || searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    tableHeaderClasses,
                    "px-6 py-3 border-b",
                    column.sortable && "cursor-pointer select-none",
                    column.width
                  )}
                  onClick={() =>
                    column.sortable && handleSort(String(column.key))
                  }
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <svg
                        className="w-4 h-4 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={cn(
                    "px-6 py-12 text-center text-sm",
                    isDark ? "text-dark-muted" : "text-gray-500"
                  )}
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <svg
                      className={`w-16 h-16 ${
                        isDark ? "text-dark-muted" : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-lg mb-1">Tidak ada data</p>
                      <p className="text-sm opacity-80">{emptyMessage}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={tableRowClasses(!!onRowClick)}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const rawValue = (row as any)[column.key];
                    return (
                      <td
                        key={String(column.key)}
                        className={tableCellClasses}
                        style={{ width: column.width }}
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

      {pagination && totalPages > 0 && (
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            isDark ? "border-dark-border" : "border-gray-200"
          }`}
        >
          <div
            className={`text-sm ${
              isDark ? "text-dark-secondary" : "text-gray-700"
            }`}
          >
            Menampilkan{" "}
            {Math.min(
              (pagination.currentPage - 1) * pagination.pageSize + 1,
              pagination.totalItems
            )}{" "}
            -{" "}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalItems
            )}{" "}
            dari {pagination.totalItems} data
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
            >
              Sebelumnya
            </Button>

            <span
              className={`text-sm mx-2 ${
                isDark ? "text-dark-secondary" : "text-gray-700"
              }`}
            >
              {pagination.currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === totalPages}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
