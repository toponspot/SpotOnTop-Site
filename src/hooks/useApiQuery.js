import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { fetchQuery, getEntry, queryKey } from '../services/queryStore';

/**
 * Reads one API resource.
 *
 *   const { data, error, isLoading, refetch } = useApiQuery('brands');
 *   useApiQuery('trafficSnapshot', { market }, { pollInterval: 1000 });
 *
 * - Requests are shared between components using the same name + params.
 * - While params change, the previous data stays visible (no flicker) and
 *   `isPreviousData` is true so the UI can dim it.
 * - Polling pauses while the browser tab is hidden.
 */
export function useApiQuery(name, params = {}, { pollInterval = null, enabled = true } = {}) {
  const key = queryKey(name, params);
  const entry = getEntry(key);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const subscribe = useCallback(
    (listener) => {
      entry.listeners.add(listener);
      return () => entry.listeners.delete(listener);
    },
    [entry],
  );
  const snapshot = useSyncExternalStore(subscribe, () => entry.snapshot, () => entry.snapshot);

  useEffect(() => {
    if (!enabled) return;
    const { status } = getEntry(key).snapshot;
    if (status === 'idle' || status === 'error') fetchQuery(name, paramsRef.current).catch(() => {});
  }, [key, name, enabled]);

  useEffect(() => {
    if (!enabled || !pollInterval) return undefined;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') fetchQuery(name, paramsRef.current).catch(() => {});
    }, pollInterval);
    return () => window.clearInterval(id);
  }, [key, name, enabled, pollInterval]);

  // Keep the last good data while a new key (e.g. a new filter) loads.
  const lastData = useRef(undefined);
  if (snapshot.data !== undefined) lastData.current = snapshot.data;
  const data = snapshot.data ?? lastData.current;

  const refetch = useCallback(
    (extraParams) => fetchQuery(name, paramsRef.current, { force: true, extraParams }),
    [name],
  );

  return {
    data,
    error: snapshot.error,
    isLoading: data === undefined && snapshot.status !== 'error',
    isRefreshing: snapshot.status === 'refreshing' || (snapshot.status === 'loading' && data !== undefined),
    /** True while showing the previous params' data until the new request lands. */
    isPreviousData: snapshot.data === undefined && data !== undefined,
    refetch,
  };
}
