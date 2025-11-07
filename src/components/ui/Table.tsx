import React from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  striped?: boolean;
  compact?: boolean;
  hover?: boolean;
}

export function Table<T>({
  columns,
  data,
  className,
  onRowClick,
  emptyMessage = "No data available",
  striped = true,
  compact = false,
  hover = true,
}: TableProps<T>) {
  const { isDark } = useTheme();

  // Base classes untuk dark theme
  const tableClasses = cn(
    "overflow-x-auto rounded-lg transition-colors duration-200",
    isDark
      ? "bg-dark-card shadow-lg border border-dark-border"
      : "bg-white shadow border border-gray-200",
    className
  );

  const headerClasses = cn(
    "text-left font-medium uppercase tracking-wider transition-colors duration-200",
    compact ? "px-4 py-2 text-xs" : "px-6 py-3 text-xs",
    isDark
      ? "bg-dark-secondary text-dark-muted border-b border-dark-border"
      : "bg-gray-50 text-gray-500 border-b border-gray-200"
  );

  const rowClasses = cn(
    "transition-colors duration-150",
    striped && (isDark ? "even:bg-dark-secondary/50" : "even:bg-gray-50"),
    hover && (isDark ? "hover:bg-dark-hover" : "hover:bg-gray-50"),
    onRowClick && "cursor-pointer"
  );

  const cellClasses = (column?: Column<T>) =>
    cn(
      "transition-colors duration-200",
      compact ? "px-4 py-2" : "px-6 py-4",
      isDark ? "text-dark-primary" : "text-gray-900",
      column?.cellClassName
    );

  const emptyCellClasses = cn(
    "text-center transition-colors duration-200",
    compact ? "px-4 py-8" : "px-6 py-12",
    isDark ? "text-dark-muted" : "text-gray-500"
  );

  return (
    <div className={tableClasses}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(headerClasses, column.headerClassName)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={
            isDark ? "divide-y divide-dark-border" : "divide-y divide-gray-200"
          }
        >
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowClasses}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className={cellClasses(column)}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : (row[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className={emptyCellClasses}>
                <div className="flex flex-col items-center justify-center space-y-2">
                  <svg
                    className={cn(
                      "opacity-50",
                      isDark ? "text-dark-muted" : "text-gray-400",
                      compact ? "w-8 h-8" : "w-12 h-12"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className={compact ? "text-sm" : "text-base"}>
                    {emptyMessage}
                  </span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
