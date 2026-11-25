import { useCallback, useEffect, useRef, useState } from 'react';
import { callApi } from '../services/api';

/**
 * Sends one write (POST/PUT…) to an endpoint.
 *
 *   const { mutate, isLoading, error } = useApiMutation('joinWaitlist');
 *   const result = await mutate({ email });   // throws on failure
 */
export function useApiMutation(name, { onSuccess, onError } = {}) {
  const [state, setState] = useState({ isLoading: false, error: null, data: undefined });
  const callbacks = useRef({ onSuccess, onError });
  callbacks.current = { onSuccess, onError };
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const mutate = useCallback(
    async (params = {}) => {
      setState((current) => ({ ...current, isLoading: true, error: null }));
      try {
        const data = await callApi(name, params);
        if (mounted.current) setState({ isLoading: false, error: null, data });
        callbacks.current.onSuccess?.(data, params);
        return data;
      } catch (error) {
        if (mounted.current) setState({ isLoading: false, error, data: undefined });
        callbacks.current.onError?.(error, params);
        throw error;
      }
    },
    [name],
  );

  const reset = useCallback(() => setState({ isLoading: false, error: null, data: undefined }), []);

  return { mutate, reset, ...state };
}
