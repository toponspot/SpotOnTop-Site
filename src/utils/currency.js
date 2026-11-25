export const CURRENCIES = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
];

/**
 * Formats an amount that is already in `currency` (₹ with Indian grouping, $ with US grouping).
 * Prices come from pricing.json per currency, so nothing is ever converted from rupees.
 */
export function formatMoney(amount, currency = 'INR') {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/** Picks the amount for `currency` from a { INR, USD } price. Plain numbers pass through. */
export function amountIn(price, currency = 'INR') {
  if (price && typeof price === 'object') return price[currency] ?? null;
  return price ?? null;
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatPercent(value, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}
