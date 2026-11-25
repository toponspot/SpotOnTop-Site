import { amountIn } from './currency';
import { findSlot } from './slots';

/** Rounds to whole currency units; the toFixed guards against 0.1 + 0.2 style float noise. */
const roundMoney = (value) => Math.round(Number(value.toFixed(6)));

/**
 * Pure pricing function shared by the quote builder, the quote modal and the
 * "How it works" demo. All amounts are in `currency` (INR or USD, read from pricing.json).
 *
 *   price × months, minus the duration discount, × reach multiplier  (monthly banners, traffic report)
 *   one-time items (newsletter, founder story) are added once, with no duration discount
 *   then GST on INR quotes only. USD quotes show "Taxes as applicable".
 *
 * Rounding happens once per line, at the end, never on a half-finished figure.
 * Returns null until the catalog (slots and options) has loaded.
 */
export function calculateQuote({ slotId, months, audienceId, extras = [] }, catalog, currency = 'INR') {
  if (!catalog?.slots?.length || !catalog.durations?.length || !catalog.audiences?.length) return null;
  const slot = findSlot(catalog.slots, slotId) ?? catalog.slots[0];
  const duration = catalog.durations.find((item) => item.months === months) ?? catalog.durations[0];
  const audience = catalog.audiences.find((item) => item.id === audienceId) ?? catalog.audiences[0];
  const gstRate = catalog.gstRates?.[currency] ?? null;

  const slotRate = amountIn(slot.rate, currency) ?? 0;
  const slotTotal = roundMoney(slotRate * duration.months * (1 - duration.discount) * audience.multiplier);

  const extraLines = (catalog.extras ?? [])
    .filter((extra) => extras.includes(extra.id))
    .map((extra) => {
      const unitPrice = amountIn(extra.price, currency) ?? 0;
      const monthsFactor = extra.recurring ? duration.months : 1;
      const discount = extra.durationDiscount ? duration.discount : 0;
      return { ...extra, price: roundMoney(unitPrice * monthsFactor * (1 - discount)) };
    });
  const extrasTotal = extraLines.reduce((sum, extra) => sum + extra.price, 0);
  const subtotal = slotTotal + extrasTotal;
  const gst = gstRate ? roundMoney(subtotal * gstRate) : 0;

  return {
    slot,
    duration,
    audience,
    currency,
    slotRate,
    slotTotal,
    extraLines,
    extrasTotal,
    subtotal,
    gst,
    gstRate,
    taxesAsApplicable: !gstRate,
    total: subtotal + gst,
  };
}

export function gstLabel(gstRate) {
  return `GST (${Math.round((gstRate ?? 0) * 100)}%)`;
}

export const TAXES_AS_APPLICABLE = 'Taxes as applicable';

/** Founding offer: the rate is held for `lockMonths` from the start date. */
export const FOUNDING_LOCK_TEXT = (months = 12) => `Founding rate locked for ${months} months from your start date.`;

/** Adds whole months without overflowing into the next month (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(date, months) {
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(date.getDate(), lastDay));
  return result;
}

/** YYYY-MM-DD in the visitor's own time zone. */
export function toDateString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
