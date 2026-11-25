/**
 * ════════════════════════════════════════════════════════════════════════
 *  RESPONSE ADAPTERS · map your API's shapes to what the UI expects
 * ════════════════════════════════════════════════════════════════════════
 *  Each function receives the raw JSON from a real endpoint and returns the
 *  shape documented in the matching src/demo-data file. The defaults pass
 *  data through unchanged, which works when your backend already returns
 *  that shape. If it does not, change only the adapter, never a component.
 *
 *  Adapters run on real responses only. Demo data is already in UI shape.
 *  `requestAdapters` do the reverse for outgoing payloads.
 */

const passThrough = (raw) => raw;

/** Unwraps common envelopes such as { data: [...] } or { results: [...] }. */
export function unwrap(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    if ('data' in raw && Object.keys(raw).length <= 3) return raw.data;
    if ('results' in raw) return raw.results;
  }
  return raw;
}

/**
 * Helper for Meta Graph API insights envelopes:
 *   { data: [{ name: 'page_impressions', values: [{ value: 123, end_time: '…' }] }] }
 * becomes { page_impressions: 123 } using each metric's latest value.
 * Metric names vary by API version; check Meta's current documentation.
 */
export function fromGraphInsights(raw) {
  const metrics = {};
  for (const metric of raw?.data ?? []) {
    const values = metric.values ?? [];
    const latest = values[values.length - 1]?.value;
    metrics[metric.name] = typeof latest === 'object' && latest !== null ? latest : Number(latest ?? 0);
  }
  return metrics;
}

export const adapters = {
  appSettings: passThrough,
  heroStats: passThrough,
  trafficSnapshot: passThrough,
  slots: unwrap,
  brands: unwrap,
  featured: passThrough,
  votes: passThrough,
  pricing: unwrap,
  quoteOptions: passThrough,
  faqs: unwrap,
  brandProfile: passThrough,
  waitlistOptions: passThrough,
  requestQuote: passThrough,
  saveBrandProfile: passThrough,
  castVote: passThrough,
  joinWaitlist: passThrough,
  recordContactView: passThrough,

  /*
   * Example: if /stats/hero were a proxy returning raw Meta insights, map it here.
   *
   * heroStats: (raw) => {
   *   const m = fromGraphInsights(raw);
   *   return {
   *     peopleNow: m.page_impressions_unique ?? 0,
   *     visitsToday: m.page_impressions ?? 0,
   *     contactClicks: m.page_total_actions ?? 0,
   *     clickRate: m.page_impressions ? (m.page_total_actions ?? 0) / m.page_impressions : 0,
   *     feed: [],
   *   };
   * },
   */
};

/** Outgoing payload mappers, keyed like `adapters`. Missing = send as-is. */
export const requestAdapters = {
  // requestQuote: (payload) => ({ ...payload, source: 'website' }),
};
