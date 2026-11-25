/**
 * DEMO DATA · GET /quote-options
 * Choices offered in the quote builder. Prices are { INR, USD } before GST, from src/config/pricing.json.
 * `defaults` is the configuration the builder opens with.
 */
import { FOUNDING_ACTIVE, PRICING, extraPrice } from './priceBook.js';

export const QUOTE_PLACEMENTS = ['home-top', 'home-middle', 'category', 'article-inline'];

const discountFor = (months) => PRICING.durationDiscounts[String(months)] ?? 0;
const durationNote = (months) => {
  const discount = discountFor(months);
  return discount ? `Save ${Math.round(discount * 100)}%` : 'Standard rate';
};

/** Discount applies to monthly banners and the traffic report only (see EXTRAS.durationDiscount). */
export const DURATIONS = [1, 3, 6, 12].map((months) => ({
  months,
  label: `${months} ${months === 1 ? 'month' : 'months'}`,
  note: durationNote(months),
  discount: discountFor(months),
}));

export const AUDIENCES = [
  { id: 'india', label: 'India', multiplier: 1, flags: ['india'] },
  { id: 'usa', label: 'USA', multiplier: 1.1, flags: ['usa'] },
  { id: 'both', label: 'India and USA', multiplier: 1.7, flags: ['india', 'usa'] },
];

const extra = (id, label) => {
  const { recurring, durationDiscount, unit } = PRICING.extras[id];
  return { id, label, price: extraPrice(id), unit, recurring, durationDiscount, founding: FOUNDING_ACTIVE };
};

export const EXTRAS = [
  extra('newsletter', 'Newsletter mention'),
  extra('founder', 'Founder story'),
  extra('report', 'Monthly traffic report'),
];

export const QUOTE_DEFAULTS = {
  slotId: 'home-top',
  months: 12,
  audienceId: 'india',
  extras: [],
};
