import { useState, useCallback, useEffect, useRef } from "react";
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
  train: (overrideParams?: Partial<TRequest>) => Promise<void>;
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
  const isMounted = useRef(false);

  const setParam = useCallback(
    (key: string, value: number | string | boolean) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const train = useCallback(async (overrideParams?: Partial<TRequest>) => {
    setLoading(true);
    setError(null);
    try {
      const isPlainObject =
        overrideParams &&
        typeof overrideParams === "object" &&
        !("nativeEvent" in overrideParams) &&
        !("target" in overrideParams);
      const payload = isPlainObject ? { ...params, ...overrideParams } : params;
      const response = await api.post<TResponse>(endpoint, payload);
      setResult(response.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to train model";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  // Automatically re-train whenever params change (e.g. selecting from dataset/parameter menus)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      train();
    }, 100);
    return () => clearTimeout(timer);
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  return { params, setParam, result, loading, error, train };
}
