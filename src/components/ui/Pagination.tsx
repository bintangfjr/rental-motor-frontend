import React from "react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    let adjustedStartPage = startPage;

    // Hitung endPage
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Jika jumlah halaman kurang dari maxVisiblePages, geser startPage
    if (endPage - startPage + 1 < maxVisiblePages) {
      adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = adjustedStartPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200",
        className
      )}
    >
      <div className="flex items-center space-x-2">
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
      </div>

      <div className="text-sm text-gray-700">
        Page <span className="font-medium">{currentPage}</span> of{" "}
        <span className="font-medium">{totalPages}</span>
      </div>
    </div>
  );
};
