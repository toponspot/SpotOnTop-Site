import { callApi } from './api';

/**
 * A tiny shared cache for API reads. Components asking for the same
 * resource with the same params share one request and one result.
 */
const entries = new Map();
const IDLE = Object.freeze({ status: 'idle', data: undefined, error: null, updatedAt: 0 });

function stableStringify(value) {
  if (!value || typeof value !== 'object') return JSON.stringify(value ?? null);
  return `{${Object.keys(value)
    .sort()
    .filter((key) => value[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`;
}

export function queryKey(name, params) {
  return `${name}:${stableStringify(params)}`;
}

export function getEntry(key) {
  let entry = entries.get(key);
  if (!entry) {
    entry = { snapshot: IDLE, listeners: new Set(), promise: null };
    entries.set(key, entry);
  }
  return entry;
}

function update(entry, patch) {
  entry.snapshot = { ...entry.snapshot, ...patch };
  entry.listeners.forEach((listener) => listener());
}

/** Fetches (or joins an in-flight fetch) and stores the result. */
export function fetchQuery(name, params = {}, { force = false, extraParams } = {}) {
  const entry = getEntry(queryKey(name, params));
  if (entry.promise && !force) return entry.promise;

  update(entry, { status: entry.snapshot.data === undefined ? 'loading' : 'refreshing' });
  const promise = callApi(name, { ...params, ...extraParams })
    .then((data) => {
      if (entry.promise === promise) update(entry, { status: 'success', data, error: null, updatedAt: Date.now() });
      return data;
    })
    .catch((error) => {
      if (entry.promise === promise) update(entry, { status: 'error', error });
      throw error;
    })
    .finally(() => {
      if (entry.promise === promise) entry.promise = null;
    });
  entry.promise = promise;
  return promise;
}

/** Replaces cached data, e.g. for optimistic updates. `updater` may be a function. */
export function setQueryData(name, params, updater) {
  const entry = getEntry(queryKey(name, params));
  const data = typeof updater === 'function' ? updater(entry.snapshot.data) : updater;
  update(entry, { status: 'success', data, error: null, updatedAt: Date.now() });
}

export function getQueryData(name, params) {
  return getEntry(queryKey(name, params)).snapshot.data;
}
