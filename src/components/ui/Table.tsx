import React from "react";
import { cn } from "../../utils/cn";

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  className,
  onRowClick,
  emptyMessage = "No data available",
}: TableProps<T>) {
  return (
    <div
      className={cn("overflow-x-auto bg-white shadow rounded-lg", className)}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "hover:bg-gray-50 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : (row[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
