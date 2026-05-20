"use client";

import { useCallback, useState } from "react";
import { ApiError } from "@/lib/api/config";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useApi<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const [state, setState] = useState<AsyncState<TResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      setState((s) => ({
        ...s,
        loading: true,
        error: null,
      }));

      try {
        const result = await fn(...args);

        setState({
          data: result,
          loading: false,
          error: null,
        });

        return result;
      } catch (err) {
        let message = "Unknown error";

        if (err instanceof ApiError) {
          message = err.message || `Request failed (${err.status})`;
        } else if (err instanceof Error) {
          message = err.message;
        }

        setState({
          data: null,
          loading: false,
          error: message,
        });

        return undefined;
      }
    },
    [fn],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
