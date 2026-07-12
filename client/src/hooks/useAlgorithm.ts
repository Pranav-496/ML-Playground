import { useState, useCallback } from "react";
import api from "@/lib/api";

interface UseAlgorithmOptions<TRequest> {
  endpoint: string;
  defaultParams: TRequest;
}

interface UseAlgorithmReturn<TRequest, TResponse> {
  params: TRequest;
  setParam: (key: string, value: number | string | boolean) => void;
  result: TResponse | null;
  loading: boolean;
  error: string | null;
  train: () => Promise<void>;
}

export function useAlgorithm<
  TRequest extends Record<string, unknown>,
  TResponse,
>({
  endpoint,
  defaultParams,
}: UseAlgorithmOptions<TRequest>): UseAlgorithmReturn<TRequest, TResponse> {
  const [params, setParams] = useState<TRequest>(defaultParams);
  const [result, setResult] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setParam = useCallback(
    (key: string, value: number | string | boolean) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const train = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<TResponse>(endpoint, params);
      setResult(response.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to train model";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  return { params, setParam, result, loading, error, train };
}
