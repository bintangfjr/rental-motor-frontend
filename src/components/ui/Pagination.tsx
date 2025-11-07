import React from "react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { useTheme } from "../../hooks/useTheme";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  compact?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showInfo = true,
  compact = false,
}) => {
  const { isDark } = useTheme();

  const getPageNumbers = () => {
    if (totalPages <= 1) return [];

    const pages: (number | string)[] = [];
    const maxVisiblePages = compact ? 3 : 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1); // Diubah ke const

    // Adjust start page if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-t transition-colors duration-200",
        isDark
          ? "bg-dark-card border-dark-border text-dark-primary"
          : "bg-white border-gray-200 text-gray-700",
        compact && "px-3 py-2",
        className
      )}
    >
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size={compact ? "sm" : "md"}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={cn(
            "transition-colors",
            isDark && "border-dark-border hover:bg-dark-hover"
          )}
        >
          <span className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {!compact && "Previous"}
          </span>
        </Button>

        {/* Page Numbers - Hidden on mobile if compact */}
        <div
          className={cn(
            "items-center space-x-1",
            compact ? "hidden sm:flex" : "flex"
          )}
        >
          {pageNumbers.map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className={cn(
                  "px-3 py-1 text-sm",
                  isDark ? "text-dark-muted" : "text-gray-500"
                )}
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "primary" : "outline"}
                size={compact ? "sm" : "md"}
                onClick={() => onPageChange(page as number)}
                className={cn(
                  currentPage === page
                    ? "font-semibold"
                    : isDark
                    ? "border-dark-border hover:bg-dark-hover"
                    : "border-gray-300 hover:bg-gray-50",
                  "min-w-[2.5rem]"
                )}
              >
                {page}
              </Button>
            )
          )}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size={compact ? "sm" : "md"}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={cn(
            "transition-colors",
            isDark && "border-dark-border hover:bg-dark-hover"
          )}
        >
          <span className="flex items-center">
            {!compact && "Next"}
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </Button>
      </div>

      {/* Page Info */}
      {showInfo && (
        <div
          className={cn(
            "text-sm transition-colors",
            isDark ? "text-dark-secondary" : "text-gray-600",
            compact && "hidden sm:block"
          )}
        >
          Page{" "}
          <span
            className={cn(
              "font-medium",
              isDark ? "text-dark-primary" : "text-gray-900"
            )}
          >
            {currentPage}
          </span>{" "}
          of{" "}
          <span
            className={cn(
              "font-medium",
              isDark ? "text-dark-primary" : "text-gray-900"
            )}
          >
            {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};
