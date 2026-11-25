import { API_CONFIG, ENDPOINTS } from '../config/api.config';

/** Error thrown for network failures, timeouts and non-2xx responses. */
export class ApiError extends Error {
  constructor(message, { status = 0, data = null, endpoint, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.endpoint = endpoint;
  }
}

const PATH_PARAM = /:([A-Za-z_][A-Za-z0-9_]*)/g;

/** Fills :params in the path and returns the URL plus the params left over. */
function resolveUrl(path, params) {
  const rest = { ...params };
  const filled = path.replace(PATH_PARAM, (_, key) => {
    if (rest[key] === undefined || rest[key] === null) throw new Error(`Missing path parameter "${key}" for ${path}`);
    const value = encodeURIComponent(rest[key]);
    delete rest[key];
    return value;
  });
  const absolute = /^https?:\/\//i.test(filled);
  const url = new URL(absolute ? filled : `${API_CONFIG.baseUrl}${filled}`, window.location.origin);
  return { url, rest };
}

function messageFrom(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.slice(0, 200);
  return data.message || data.error?.message || data.error || '';
}

/**
 * Low-level HTTP call for one named endpoint in ENDPOINTS.
 * GET sends `params` as the query string; other methods send them as JSON.
 */
export async function httpRequest(name, params = {}, { signal } = {}) {
  const endpoint = ENDPOINTS[name];
  if (!endpoint) throw new Error(`Unknown endpoint "${name}". Add it to ENDPOINTS in src/config/api.config.js.`);

  const method = (endpoint.method || 'GET').toUpperCase();
  const { url, rest } = resolveUrl(endpoint.path, params);
  const hasBody = method !== 'GET' && method !== 'HEAD';
  if (!hasBody) {
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    });
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });

  const headers = {
    Accept: 'application/json',
    ...(hasBody && { 'Content-Type': 'application/json' }),
    ...(API_CONFIG.token && { Authorization: `Bearer ${API_CONFIG.token}` }),
    ...API_CONFIG.headers,
  };

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: hasBody ? JSON.stringify(rest) : undefined,
      credentials: API_CONFIG.withCredentials ? 'include' : 'same-origin',
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = controller.signal.aborted && !signal?.aborted;
    throw new ApiError(
      aborted ? 'The server took too long to respond. Please try again.' : 'Could not reach the server. Check your connection and try again.',
      { endpoint: name, cause: error },
    );
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(messageFrom(data) || `Request failed with status ${response.status}.`, {
      status: response.status,
      data,
      endpoint: name,
    });
  }
  return data;
}
