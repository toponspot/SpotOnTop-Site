/**
 * DEMO STATS ENGINE · the "Reference logic" of Live Stats Spec v2, plus the response shapes.
 *
 * Pure functions of the clock: no network, no randomness, no browser APIs. The same time always
 * gives the same numbers, so every visitor sees the same figures, and reloading within the same
 * 15 seconds shows the same number. It runs in the browser demo (demoApi.js) and in
 * scripts/mock-api.mjs, so a real backend can copy it as a reference.
 *
 * Replace with real data later: point the endpoints at your API (see api.config.js).
 * Keep the response shape and set "mode": "live", and the "Sample data · demo" badge hides itself.
 */
import {
    CITY_SPLIT,
    DERIVED_RATES,
    DEMO_BADGE,
    DEVICE_SPLIT,
    HERO_CLICK_RATE,
    HOURLY_CURVES,
    SOURCE_SPLIT,
    STATS_CONFIG,
    STATS_SEEDS,
    STATS_TIMEZONES,
} from './stats.js';

const IST_OFFSET_MS = 19800000; // +05:30
const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const CACHE_MS = 10000;

/* ── Reference logic (section 4 of the spec) ───────────────────────────── */

const hash = (n) => {
    n = (n ^ 61) ^ (n >>> 16);
    n += n << 3;
    n ^= n >>> 4;
    n = Math.imul(n, 0x27d4eb2d);
    n ^= n >>> 15;
    return (n >>> 0) / 4294967296;
};

/** Smooth, deterministic noise in [-0.5, 0.5] that changes with the 15-second bucket `b`. */
const noise = (b, seed) => {
    const k = b >> 3;
    const f = (b % 8) / 8;
    const u = f * f * (3 - 2 * f);
    return hash(k + seed) * (1 - u) + hash(k + 1 + seed) * u - 0.5;
};

const formatters = {};
const formatterFor = (zone) =>
    formatters[zone] ||
    (formatters[zone] = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'short',
        hourCycle: 'h23',
    }));

function localTime(t, zone) {
    const parts = formatterFor(zone).formatToParts(t);
    const get = (type) => parts.find((part) => part.type === type).value;
    return { h: +get('hour') + get('minute') / 60, weekend: /Sat|Sun/.test(get('weekday')) };
}

function regionActive(t, region, config) {
    const { h, weekend } = localTime(t, STATS_TIMEZONES[region]);
    const curve = HOURLY_CURVES[region];
    const hour = Math.floor(h);
    const fraction = h - hour;
    const level = curve[hour] * (1 - fraction) + curve[(hour + 1) % 24] * fraction;
    const share = region === 'india' ? config.indiaShare : config.usaShare;
    const bucket = Math.floor(t / config.bucketMs);
    return Math.round(
        config.base * share * level * (weekend ? config.weekendFactor : 1) * (1 + config.noiseStrength * noise(bucket, STATS_SEEDS[region])),
    );
}

/** Visitors on the site at time `t`: { india, usa, total }. */
export function activeAt(t, config = STATS_CONFIG) {
    const india = regionActive(t, 'india', config);
    const usa = regionActive(t, 'usa', config);
    return { india, usa, total: Math.max(1, india + usa) };
}

const istDayStart = (t) => t - ((t + IST_OFFSET_MS) % DAY_MS);

/** Sums active-now over 5-minute slots from `from` to `to` (inclusive), times 0.25. */
function sumSlots(from, to, config) {
    let india = 0;
    let usa = 0;
    let total = 0;
    for (let x = from; x <= to; x += config.visitsSlotMs) {
        const now = activeAt(x, config);
        india += now.india * config.visitsScale;
        usa += now.usa * config.visitsScale;
        total += now.total * config.visitsScale;
    }
    return { india: Math.round(india), usa: Math.round(usa), total: Math.round(total) };
}

/** Visits since 12:00 am IST up to `t`. The `total` is the spec's visitsToday(). */
export function visitsTodayAt(t, config = STATS_CONFIG) {
    return sumSlots(istDayStart(t), t, config);
}

/* Finished days never change, so they are computed once. */
const finishedDays = new Map();
function visitsOnDay(dayStart, t, config) {
    const dayEnd = dayStart + DAY_MS - 1;
    if (t < dayEnd) return sumSlots(dayStart, t, config);
    if (!finishedDays.has(dayStart)) finishedDays.set(dayStart, sumSlots(dayStart, dayEnd, config));
    return finishedDays.get(dayStart);
}

/* ── Shares: ±3% wobble, then rounded so each list adds up to exactly 100 ── */

function roundToHundred(values) {
    const sum = values.reduce((total, value) => total + value, 0) || 1;
    const scaled = values.map((value) => (value / sum) * 100);
    const floors = scaled.map(Math.floor);
    let left = 100 - floors.reduce((total, value) => total + value, 0);
    scaled
        .map((value, index) => ({ index, rest: value - Math.floor(value) }))
        .sort((a, b) => b.rest - a.rest)
        .forEach(({ index }) => {
            if (left > 0) {
                floors[index] += 1;
                left -= 1;
            }
        });
    return floors;
}

function wobble(weights, bucket, seed, config) {
    return roundToHundred(
        weights.map((weight, index) => weight * (1 + config.shareWobble * 2 * noise(bucket, seed + index * 131))),
    );
}

const withPct = (list, pcts) => list.map((item, index) => ({ name: item.name, pct: pcts[index] }));

/* ── Response (section 5) ──────────────────────────────────────────────── */

const isoIST = (t) => `${new Date(t + IST_OFFSET_MS).toISOString().slice(0, 19)}+05:30`;
const dayLabel = (t) => new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' }).format(t);

/** Everything the dashboard shows at time `t`, in the shape of the spec's sample response. */
export function buildStats(t = Date.now(), config = STATS_CONFIG) {
    const bucket = Math.floor(t / config.bucketMs);
    const now = activeAt(t, config);
    const visits = visitsTodayAt(t, config);

    // One sample an hour for the last 24 hours, oldest first, ending with "now".
    const hourly = Array.from({ length: 24 }, (_, index) => activeAt(t - (23 - index) * HOUR_MS, config));

    const dayStart = istDayStart(t);
    const week = Array.from({ length: 7 }, (_, index) => {
        const start = dayStart - (6 - index) * DAY_MS;
        return { day: dayLabel(start + 12 * HOUR_MS), ...visitsOnDay(start, t, config) };
    });

    const [indiaPct, usaPct] = wobble([now.india, now.usa], bucket, 4242, config);
    const cityPcts = (region, seed) => withPct(CITY_SPLIT[region], wobble(CITY_SPLIT[region].map((city) => city.pct), bucket, seed, config));

    return {
        mode: 'demo',
        source: 'sample',
        badge: DEMO_BADGE,
        asOf: isoIST(t),
        activeNow: { total: now.total, india: now.india, usa: now.usa },
        visitsToday: visits.total,
        last24h: hourly.map((point) => point.total),
        countries: [
            { name: 'India', pct: indiaPct },
            { name: 'USA', pct: usaPct },
        ],
        cities: { india: cityPcts('india', 1000), usa: cityPcts('usa', 2000) },
        devices: Object.fromEntries(withPct(DEVICE_SPLIT, wobble(DEVICE_SPLIT.map((d) => d.pct), bucket, 3000, config)).map((d) => [d.name, d.pct])),
        sources: withPct(SOURCE_SPLIT, wobble(SOURCE_SPLIT.map((s) => s.pct), bucket, 4000, config)),
        // Extra detail the page needs that the spec's sample does not list.
        detail: { visits, hourly, week, bucket },
    };
}

/* ── Cache: one answer for everyone, refreshed every 10 seconds ─────────── */
let cached = { slot: -1, value: null };
export function getStats(t = Date.now()) {
    const slot = Math.floor(t / CACHE_MS);
    if (cached.slot !== slot) cached = { slot, value: buildStats(t) };
    return cached.value;
}

/* ── Shapes the page reads ──────────────────────────────────────────────── */

const atLeastOne = (value) => Math.max(1, value);

/** GET /stats/traffic?market=all|india|usa — Live Traffic section. */
export function trafficPayload(stats, market = 'all') {
    const key = market === 'india' || market === 'usa' ? market : 'all';
    const part = key === 'all' ? 'total' : key;
    const { visits, hourly, week } = stats.detail;
    const visitsNow = atLeastOne(visits[part]);

    const regionCities = (region) =>
        stats.cities[region].filter((city) => city.name !== 'Others').map((city) => ({ ...city, market: region }));
    const othersOf = (region) => stats.cities[region].find((city) => city.name === 'Others').pct;

    let cities;
    let otherShare;
    if (key === 'all') {
        const india = stats.countries[0].pct / 100;
        const usa = stats.countries[1].pct / 100;
        const rows = [
            ...regionCities('india').map((city) => ({ ...city, raw: city.pct * india })),
            ...regionCities('usa').map((city) => ({ ...city, raw: city.pct * usa })),
        ];
        const other = othersOf('india') * india + othersOf('usa') * usa;
        const rounded = roundToHundred([...rows.map((row) => row.raw), other]);
        cities = rows.map(({ name, market: m }, index) => ({ name, market: m, share: rounded[index] }));
        otherShare = rounded[rounded.length - 1];
    } else {
        cities = regionCities(key).map(({ name, pct, market: m }) => ({ name, market: m, share: pct }));
        otherShare = othersOf(key);
    }

    return {
        market: key,
        mode: stats.mode,
        source: stats.source,
        badge: stats.badge,
        asOf: stats.asOf,
        totals: {
            visitorsNow: atLeastOne(stats.activeNow[part]),
            visitsToday: visitsNow,
            bannerViews: atLeastOne(Math.round(visitsNow * DERIVED_RATES.bannerViewsPerVisit)),
            contactClicks: atLeastOne(Math.round(visitsNow * DERIVED_RATES.contactClickRate)),
            enquiries: atLeastOne(Math.round(visitsNow * DERIVED_RATES.enquiryRate)),
        },
        history: hourly.map((point) => atLeastOne(point[part])),
        cities,
        otherShare,
        countries: key === 'all' ? stats.countries : [],
        devices: stats.devices,
        sources: stats.sources,
        weekly: week.map((day) => ({
            day: day.day,
            india: key === 'usa' ? 0 : atLeastOne(day.india),
            usa: key === 'india' ? 0 : atLeastOne(day.usa),
        })),
    };
}

/** GET /stats/hero?market=usa|india — hero card. Shows the site total, so it agrees with Live Traffic. */
export function heroPayload(stats, market = 'usa') {
    const key = market === 'india' ? 'india' : 'usa';
    const visitsNow = atLeastOne(stats.detail.visits.total);
    const nudge = 0.004 * 2 * noise(stats.detail.bucket, 5150 + (key === 'india' ? 1 : 0));
    return {
        market: key,
        mode: stats.mode,
        source: stats.source,
        badge: stats.badge,
        asOf: stats.asOf,
        peopleNow: stats.activeNow.total,
        visitsToday: visitsNow,
        contactClicks: atLeastOne(Math.round(visitsNow * DERIVED_RATES.contactClickRate)),
        clickRate: Math.round((HERO_CLICK_RATE[key] + nudge) * 10000) / 10000,
    };
}