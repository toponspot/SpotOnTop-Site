/**
 * DEMO DATA · activity feed of GET /stats/traffic
 * Wording for the simulated "Live feed" events. The traffic numbers themselves
 * (active now, visits, cities, shares) live in stats.js.
 */
export const FEED_EVENTS = [
  'Brand profile opened',
  'Contact card viewed',
  'Banner clicked',
  'Enquiry sent',
  'Newsletter link opened',
];

export const FEED_BRANDS = [
  'Harlow & Pine',
  'Kaveri Silk House',
  'Veda Estates',
  'Northstar Labs',
  'Marlowe Denim',
  'Kaveri Studio',
];

/** The same cities as the traffic split in stats.js. */
export const FEED_CITIES = {
  india: ['Mumbai', 'Delhi', 'Bengaluru', 'Pune'],
  usa: ['New York', 'SF', 'Dallas', 'Chicago'],
};