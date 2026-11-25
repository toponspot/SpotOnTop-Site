const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "2 days ago", "yesterday", "3 hours ago" from an ISO string or timestamp. */
export function formatRelativeDate(value, now = Date.now()) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return '';
  const seconds = Math.round((time - now) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

/** Milliseconds since epoch from an ISO string, Date or number. */
export function toTimestamp(value) {
  return typeof value === 'number' ? value : new Date(value).getTime();
}
