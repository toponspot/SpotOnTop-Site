/**
 * ════════════════════════════════════════════════════════════════════════
 *  API CONFIGURATION · the only file you edit to connect a real backend
 * ════════════════════════════════════════════════════════════════════════
 *
 *  1. Copy .env.example to .env and set VITE_API_BASE_URL.
 *  2. Set VITE_USE_DEMO_DATA=false to switch every endpoint to the real API,
 *     or leave it true and flip single endpoints with `demo: false` below
 *     while you integrate them one at a time.
 *  3. Put each endpoint's path in ENDPOINTS. A path can also be a full URL
 *     (https://…), so one resource can come from a different service.
 *  4. If a response is shaped differently from what the UI expects, map it
 *     in src/services/adapters.js. Components never need to change.
 *
 *  Security: anything prefixed VITE_ is bundled into the browser code and
 *  visible to every visitor. Never put a Meta app secret or a page access
 *  token here. Call Meta from your own backend and point these endpoints at it.
 */

const env = import.meta.env;

export const API_CONFIG = {
  /** e.g. https://api.spotontop.com/v1 (no trailing slash needed) */
  baseUrl: (env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, ''),

  /** true = every endpoint answers from src/demo-data (no network). */
  useDemoData: env.VITE_USE_DEMO_DATA !== 'false',

  /** Optional bearer token sent as `Authorization: Bearer <token>`. Public tokens only. */
  token: (env.VITE_API_TOKEN ?? '').trim(),

  /** Send cookies with requests (for session-cookie auth on another domain). */
  withCredentials: env.VITE_API_WITH_CREDENTIALS === 'true',

  /** Extra headers added to every request, e.g. { 'X-Tenant': 'spot-on-top' }. */
  headers: {},

  /** Abort a request that takes longer than this. */
  timeoutMs: 15000,

  /** Simulated network delay for demo responses, so loading states are visible. */
  demoLatencyMs: 350,

  /**
 * How often live data refreshes, in milliseconds (null = never).
 * The Live Stats spec asks for 15–30 s. The page eases each counter to its new value.
 */
  polling: {
    heroStats: 15000,
    trafficSnapshot: 15000,
  },
};

/**
 * One entry per resource. `:name` segments in a path are filled from the
 * request's params (e.g. /brands/:brandId/contact-views). GET params become
 * the query string; other methods send params as the JSON body.
 *
 * Set `demo: true | false` on an entry to override VITE_USE_DEMO_DATA for
 * that endpoint only.
 */
export const ENDPOINTS = {
  // ── Reads ──────────────────────────────────────────────────────────────
  appSettings: { method: 'GET', path: '/settings' }, // { pricingMode, gstRates, founding }
  heroStats: { method: 'GET', path: '/stats/hero' }, //          ?market=usa|india
  trafficSnapshot: { method: 'GET', path: '/stats/traffic' }, // ?market=all|india|usa
  slots: { method: 'GET', path: '/slots' },
  brands: { method: 'GET', path: '/brands' },
  featured: { method: 'GET', path: '/featured' },
  votes: { method: 'GET', path: '/votes' },
  pricing: { method: 'GET', path: '/pricing' },
  quoteOptions: { method: 'GET', path: '/quote-options' },
  faqs: { method: 'GET', path: '/faqs' },
  brandProfile: { method: 'GET', path: '/brand-profile' },
  waitlistOptions: { method: 'GET', path: '/waitlist/options' },

  // ── Writes ─────────────────────────────────────────────────────────────
  requestQuote: { method: 'POST', path: '/quotes' },
  saveBrandProfile: { method: 'PUT', path: '/brand-profile' },
  castVote: { method: 'POST', path: '/votes' },
  joinWaitlist: { method: 'POST', path: '/waitlist' },
  recordContactView: { method: 'POST', path: '/brands/:brandId/contact-views' },
};

/** Whether a given endpoint currently answers from demo data. */
export function usesDemoData(name) {
  return ENDPOINTS[name]?.demo ?? API_CONFIG.useDemoData;
}
