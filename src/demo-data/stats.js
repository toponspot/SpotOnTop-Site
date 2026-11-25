/**
 * DEMO DATA · GET /stats/traffic and GET /stats/hero
 * The static numbers from "Live Stats · Demo Mode (India + USA) · Developer Spec v2".
 * src/services/demo/statsEngine.js turns them into live-looking figures: it reads the
 * clock, so the numbers rise and fall through the day for India and the USA.
 *
 * When a real API (GA4) replaces this, delete this file and statsEngine.js. The
 * response shape stays the same and the badge hides itself (see DemoBadge).
 */

/** Shown next to every live widget while the API says mode = "demo". Required by the spec. */
export const DEMO_BADGE = 'Sample data · demo';

/** Section 2 and 6 of the spec. `base` = active visitors at peak scale; the rest are the preview-panel inputs. */
export const STATS_CONFIG = {
    base: 30,
    /** India : USA blend, 85 : 15. */
    indiaShare: 0.85,
    usaShare: 0.15,
    /** Applied in each region's own local weekend. */
    weekendFactor: 0.7,
    noiseStrength: 0.3,
    /** Noise changes smoothly from one 15-second time bucket to the next. */
    bucketMs: 15000,
    /** "Today's visits" = active now summed in 5-minute slots since 12:00 am IST, times this. */
    visitsSlotMs: 5 * 60 * 1000,
    visitsScale: 0.25,
    /** ±3% wobble on every share. */
    shareWobble: 0.03,
};

/** Each region has its own clock, so daylight saving is handled by Intl. */
export const STATS_TIMEZONES = { india: 'Asia/Kolkata', usa: 'America/New_York' };

/** A different noise seed per region, so the two do not move together. */
export const STATS_SEEDS = { india: 0, usa: 7919 };

/** Hourly curves, 0 = midnight local time. India peaks 9–11 pm IST, USA 6–10 pm Eastern. */
export const HOURLY_CURVES = {
    india: [.12, .10, .10, .10, .12, .18, .30, .50, .70, .90, 1, .95, .85, .80, .85, .90, .85, .80, .85, .90, .95, 1, .90, .50],
    usa: [.25, .15, .10, .08, .08, .12, .25, .45, .60, .70, .75, .75, .70, .70, .72, .75, .80, .90, 1, 1, 1, .90, .70, .45],
};

/** Section 3. City shares are percentages of that country's visitors; "Others" closes each list. */
export const CITY_SPLIT = {
    india: [
        { name: 'Mumbai', pct: 35 },
        { name: 'Delhi', pct: 15 },
        { name: 'Bengaluru', pct: 12 },
        { name: 'Pune', pct: 8 },
        { name: 'Others', pct: 30 },
    ],
    usa: [
        { name: 'New York', pct: 28 },
        { name: 'SF', pct: 20 },
        { name: 'Dallas', pct: 14 },
        { name: 'Chicago', pct: 12 },
        { name: 'Others', pct: 26 },
    ],
};

export const DEVICE_SPLIT = [
    { name: 'mobile', pct: 70 },
    { name: 'desktop', pct: 30 },
];

export const SOURCE_SPLIT = [
    { name: 'Instagram', pct: 40 },
    { name: 'Direct', pct: 25 },
    { name: 'Google', pct: 20 },
    { name: 'Referral', pct: 15 },
];

/**
 * Not in the spec, but the page also shows these. They are derived from today's visits, so
 * they always agree with it and never decrease (same ratios as the earlier demo numbers).
 */
export const DERIVED_RATES = {
    bannerViewsPerVisit: 2.24,
    contactClickRate: 0.085,
    enquiryRate: 0.008,
};

/** Hero card click rate per market, nudged slightly by the same noise. */
export const HERO_CLICK_RATE = { usa: 0.075, india: 0.082 };