import { useState, useCallback, useEffect } from "react";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  onFinally?: () => void;
}

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const useApi = <T>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<T>, options: UseApiOptions<T> = {}) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const data = await apiCall();
        setState({ data, isLoading: false, error: null });
        options.onSuccess?.(data);
        return data;
      } catch (error) {
        const apiError = error as ApiError;
        const errorMessage =
          apiError.response?.data?.message ||
          apiError.message ||
          "Terjadi kesalahan";
        setState({ data: null, isLoading: false, error: errorMessage });
        options.onError?.(error);
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
        options.onFinally?.();
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isSuccess: !!state.data && !state.error,
    isError: !!state.error,
  };
};

// Specialized hooks for common API patterns
export const useGetApi = <T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = [],
) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await apiCall();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "Terjadi kesalahan";
      setState({ data: null, isLoading: false, error: errorMessage });
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = () => {
    fetchData();
  };

  return {
    ...state,
    refetch,
    isSuccess: !!state.data && !state.error,
    isError: !!state.error,
  };
};

export const useMutationApi = <T>() => {
  return useApi<T>();
};
