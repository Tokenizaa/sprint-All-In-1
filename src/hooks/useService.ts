import { useState, useCallback } from "react";
import type { ServiceResult } from "@/services";

export interface UseServiceOptions<TData, TParams = any> {
  serviceFn: (params: TParams) => Promise<ServiceResult<TData>>;
  onSuccess?: (data: TData) => void;
  onError?: (error: string) => void;
}

export function useService<TData, TParams = any>({
  serviceFn,
  onSuccess,
  onError,
}: UseServiceOptions<TData, TParams>) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (params: TParams) => {
      setLoading(true);
      setError(null);

      try {
        const result = await serviceFn(params);

        if (result.success && result.data) {
          setData(result.data);
          onSuccess?.(result.data);
        } else {
          setError(result.error || 'Erro desconhecido');
          onError?.(result.error || 'Erro desconhecido');
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [serviceFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    data,
    error,
    execute,
    reset,
  };
}
