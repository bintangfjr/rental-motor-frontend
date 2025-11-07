import React from "react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { useTheme } from "@/hooks/useTheme";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  className?: string;
  showItemsPerPage?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  showItemsPerPage = true,
}) => {
  const { isDark } = useTheme();

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1 && !showItemsPerPage) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-t transition-colors duration-200",
        isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-200",
        className
      )}
    >
      <div className="flex-1 flex items-center justify-between">
        <div>
          <p
            className={cn(
              "text-sm",
              isDark ? "text-dark-secondary" : "text-gray-700"
            )}
          >
            Showing{" "}
            <span
              className={cn(
                "font-medium",
                isDark ? "text-dark-primary" : "text-gray-900"
              )}
            >
              {startItem}
            </span>{" "}
            to{" "}
            <span
              className={cn(
                "font-medium",
                isDark ? "text-dark-primary" : "text-gray-900"
              )}
            >
              {endItem}
            </span>{" "}
            of{" "}
            <span
              className={cn(
                "font-medium",
                isDark ? "text-dark-primary" : "text-gray-900"
              )}
            >
              {totalItems}
            </span>{" "}
            results
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {showItemsPerPage && onItemsPerPageChange && (
            <div className="flex items-center space-x-2">
              <span
                className={cn(
                  "text-sm",
                  isDark ? "text-dark-secondary" : "text-gray-700"
                )}
              >
                Items per page:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className={cn(
                  "rounded-md py-1 pl-2 pr-8 text-sm focus:ring-2 focus:ring-offset-2 transition-colors",
                  isDark
                    ? "bg-dark-secondary border-dark-border text-dark-primary focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-dark-primary"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                )}
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>

            <div className="hidden sm:flex items-center space-x-1">
              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};
