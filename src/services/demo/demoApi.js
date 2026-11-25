/**
 * DEMO API · a stand-in backend that answers every endpoint in
 * src/config/api.config.js from src/demo-data, with simulated latency.
 * Live numbers (hero, traffic) follow the Live Stats spec: see statsEngine.js.
 */
import { API_CONFIG } from '../../config/api.config';
import * as demo from '../../demo-data';
import { readStorage, writeStorage } from '../../utils/storage';
import { pick, randomInt } from '../../utils/random';
import { getStats, heroPayload, trafficPayload } from '../../demo-data/statsEngine';

const DAY_MS = 24 * 60 * 60 * 1000;
const VOTES_KEY = 'sot:votes';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));

let eventId = 0;
function makeEvent(market, at = Date.now()) {
  const resolved = market === 'all' || !market ? (Math.random() < 0.62 ? 'india' : 'usa') : market;
  eventId += 1;
  return {
    id: `evt-${eventId}`,
    market: resolved,
    city: pick(demo.FEED_CITIES[resolved]),
    label: pick(demo.FEED_EVENTS),
    brand: pick(demo.FEED_BRANDS),
    at,
  };
}

/* ── Live stats: numbers come from the spec's engine, one answer for everyone ── */

/*
 * The activity feed is not part of the stats spec, so it stays a simple generator:
 * a few events arrive between polls, timestamped across the gap.
 */
function createFeeds() {
  const now = Date.now();
  const hero = (market) => {
    const other = market === 'usa' ? 'india' : 'usa';
    return {
      feed: [
        { ...makeEvent(market, now), label: 'Brand profile opened' },
        { ...makeEvent(other, now - 4000), label: 'Brand profile opened' },
      ],
      lastEvent: now,
    };
  };
  return {
    traffic: {
      events: Array.from({ length: 10 }, (_, index) => makeEvent('all', now - index * randomInt(4000, 9000))),
      lastTick: now,
    },
    hero: { usa: hero('usa'), india: hero('india') },
  };
}

function advanceTrafficFeed(state, now) {
  const elapsed = now - state.lastTick;
  const arrivals = Math.min(6, Math.floor(elapsed / 4000));
  if (arrivals === 0) return;
  const fresh = Array.from({ length: arrivals }, (_, index) => makeEvent('all', state.lastTick + ((index + 1) * elapsed) / arrivals));
  state.events = [...fresh.reverse(), ...state.events].slice(0, 24);
  state.lastTick = now;
}

function trafficSnapshot({ market = 'all' }) {
  const now = Date.now();
  advanceTrafficFeed(feeds.traffic, now);
  const payload = trafficPayload(getStats(now), market);
  const events = payload.market === 'all' ? feeds.traffic.events : feeds.traffic.events.filter((event) => event.market === payload.market);
  return { ...payload, feed: events.slice(0, 12) };
}

function heroStats({ market = 'usa' }) {
  const now = Date.now();
  const key = market === 'india' ? 'india' : 'usa';
  const state = feeds.hero[key];
  if (now - state.lastEvent >= 4500) {
    const eventMarket = Math.random() < 0.6 ? (key === 'usa' ? 'india' : 'usa') : key;
    state.feed = [makeEvent(eventMarket, now), ...state.feed].slice(0, 2);
    state.lastEvent = now;
  }
  return { ...heroPayload(getStats(now), key), feed: state.feed, preview: demo.HERO_PREVIEWS[key] };
}

/* ── Votes: totals include the visitor's own vote, persisted locally ──── */
function loadUserVotes() {
  const stored = readStorage(VOTES_KEY, null);
  const valid = stored && typeof stored === 'object' && demo.VOTE_CATEGORIES.every((category) => category.id in stored);
  return valid ? stored : { ...demo.DEFAULT_USER_VOTES };
}

function votesResponse() {
  return {
    userVotes: { ...userVotes },
    categories: demo.VOTE_CATEGORIES.map((category) => ({
      id: category.id,
      label: category.label,
      entries: category.entries.map((entry) => ({
        ...entry,
        votes: entry.votes + (userVotes[category.id] === entry.id ? 1 : 0),
      })),
    })),
  };
}

/* ── State ─────────────────────────────────────────────────────────────── */
const feeds = createFeeds();
let userVotes = loadUserVotes();
let brandProfile = clone(demo.BRAND_PROFILE);

const handlers = {
  appSettings: () => demo.SETTINGS,
  heroStats,
  trafficSnapshot,
  slots: () => demo.SLOTS,
  brands: () => {
    const now = Date.now();
    return demo.BRANDS.map(({ updatedDaysAgo, ...brand }) => ({
      ...brand,
      updatedAt: new Date(now - updatedDaysAgo * DAY_MS).toISOString(),
    }));
  },
  featured: () => ({ slides: demo.FEATURED_SLIDES, spotOfTheWeek: demo.SPOT_OF_THE_WEEK, comparison: demo.COMPARISON }),
  votes: votesResponse,
  pricing: () => demo.PRODUCTS,
  quoteOptions: () => ({
    placements: demo.QUOTE_PLACEMENTS,
    durations: demo.DURATIONS,
    audiences: demo.AUDIENCES,
    extras: demo.EXTRAS,
    defaults: demo.QUOTE_DEFAULTS,
  }),
  faqs: () => demo.FAQS,
  brandProfile: () => brandProfile,
  waitlistOptions: () => ({ roles: demo.WAITLIST_ROLES, perks: demo.WAITLIST_PERKS }),

  requestQuote: (payload) => ({
    reference: `QT-2026-${randomInt(100, 999)}`,
    status: 'draft',
    brandName: payload.brandName,
    // Founding-rate bookings keep their start date and lock end date.
    ...(payload.startDate ? { startDate: payload.startDate, lockEndDate: payload.lockEndDate } : {}),
    receivedAt: new Date().toISOString(),
  }),
  saveBrandProfile: ({ name, pitch, email }) => {
    brandProfile = { ...brandProfile, name, pitch, email };
    return brandProfile;
  },
  castVote: ({ categoryId, entryId }) => {
    userVotes = { ...userVotes, [categoryId]: entryId ?? null };
    writeStorage(VOTES_KEY, userVotes);
    return votesResponse();
  },
  joinWaitlist: () => ({ ok: true, position: randomInt(120, 480) }),
  recordContactView: ({ brandId }) => ({ ok: true, brandId }),
};

export const demoApi = {
  async handle(name, params = {}) {
    const handler = handlers[name];
    if (!handler) throw new Error(`No demo data for endpoint "${name}". Add a handler in src/services/demo/demoApi.js.`);
    await wait(API_CONFIG.demoLatencyMs);
    return clone(handler(params));
  },
};