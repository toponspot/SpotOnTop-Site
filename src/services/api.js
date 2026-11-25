import { usesDemoData } from '../config/api.config';
import { adapters, requestAdapters } from './adapters';
import { httpRequest } from './apiClient';
import { demoApi } from './demo/demoApi';

/**
 * The single entry point for data. Components and hooks call `callApi`,
 * which answers from demo data or the real API depending on the config.
 *
 *   callApi('brands')                              → GET /brands
 *   callApi('trafficSnapshot', { market: 'india' }) → GET /stats/traffic?market=india
 *   callApi('castVote', { categoryId, entryId })   → POST /votes
 */
export async function callApi(name, params = {}, options = {}) {
  if (usesDemoData(name)) return demoApi.handle(name, params);

  const payload = requestAdapters[name] ? requestAdapters[name](params) : params;
  const raw = await httpRequest(name, payload, options);
  const adapt = adapters[name];
  return adapt ? adapt(raw, params) : raw;
}
