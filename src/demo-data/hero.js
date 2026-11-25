/**
 * DEMO DATA · GET /stats/hero?market=usa|india
 * The hero card's numbers come from stats.js (the same figures as Live Traffic).
 * `preview` decides the sponsored image: a real API can return
 * { imageUrl, imageAlt } instead of a built-in `kind`.
 */
export const HERO_PREVIEWS = {
  usa: { kind: 'billboard', imageAlt: 'Street billboard in a city at dusk advertising Spot On Top placements in the USA' },
  india: { kind: 'silk', imageAlt: 'Sponsored banner for Kaveri Silk House' },
};