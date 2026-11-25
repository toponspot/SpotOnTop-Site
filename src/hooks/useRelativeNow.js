import { useState } from 'react';
import { useInterval } from './useInterval';

/** Re-renders every `interval` ms and returns the current timestamp. */
export function useRelativeNow(interval = 1000, active = true) {
  const [now, setNow] = useState(() => Date.now());
  useInterval(() => setNow(Date.now()), active ? interval : null);
  return now;
}

/** "now", "4s", "3m", "2h" from a timestamp or ISO date string (API events may send either). */
export function formatAgo(timestamp, now) {
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const seconds = Math.max(0, Math.round((now - time) / 1000));
  if (seconds < 2) return 'now';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h`;
}
