import { useState, useMemo, useCallback } from "react";

interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
  maxPagesToShow?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  items: number[];
  hasNext: boolean;
  hasPrev: boolean;
  showingStart: number;
  showingEnd: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  getPageItems: <T>(items: T[]) => T[];
}

export const usePagination = ({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
  maxPagesToShow = 5,
}: UsePaginationOptions): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);
  const showingStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const items = useMemo(() => {
    const pages: number[] = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages, maxPagesToShow]);

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const getPageItems = useCallback(
    <T>(items: T[]): T[] => {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return items.slice(startIndex, endIndex);
    },
    [currentPage, pageSize],
  );

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    items,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    showingStart,
    showingEnd,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    getPageItems,
  };
};

// Hook for API-based pagination
interface UseApiPaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export const useApiPagination = ({
  initialPage = 1,
  initialPageSize = 10,
}: UseApiPaginationOptions = {}) => {
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0,
  });

  const updatePagination = useCallback(
    (data: { total: number; page?: number; pageSize?: number }) => {
      const totalPages = Math.ceil(
        data.total / (data.pageSize || pagination.pageSize),
      );
      setPagination((prev) => ({
        page: data.page || prev.page,
        pageSize: data.pageSize || prev.pageSize,
        total: data.total,
        totalPages,
      }));
    },
    [pagination.pageSize],
  );

  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages)),
    }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      pageSize,
      page: 1, // Reset to first page when changing page size
    }));
  }, []);

  return {
    ...pagination,
    updatePagination,
    goToPage,
    setPageSize,
    hasNext: pagination.page < pagination.totalPages,
    hasPrev: pagination.page > 1,
  };
};
