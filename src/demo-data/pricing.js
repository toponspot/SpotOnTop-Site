/**
 * DEMO DATA · GET /pricing
 * Pricing cards. `price` is { INR, USD } from src/config/pricing.json (current mode).
 * `quotePreset` describes how "Customise this" pre-fills the quote builder.
 */
import { FOUNDING_ACTIVE, PRICING, extraPrice, slotPrice } from './priceBook.js';

export const PRODUCTS = [
  {
    id: 'banner-slot',
    name: 'Banner slot',
    price: slotPrice(PRICING.products['banner-slot'].slot),
    per: '/ month',
    highlight: true,
    tag: 'Most chosen',
    founding: FOUNDING_ACTIVE,
    // Home top is the banner-slot card, so it carries "4 places, N left".
    places: { total: PRICING.founding.placesTotal, taken: PRICING.founding.placesTaken },
    features: ['Premium website placement', 'Traffic reporting', 'Sponsored label'],
    quotePreset: { slotId: PRICING.products['banner-slot'].slot },
  },
  {
    id: 'newsletter-mention',
    name: 'Newsletter mention',
    price: extraPrice(PRICING.products['newsletter-mention'].extra),
    per: '/ issue',
    founding: FOUNDING_ACTIVE,
    features: ['One newsletter issue', 'Brand link and copy', 'Delivery summary'],
    quotePreset: { addExtra: 'newsletter' },
  },
  {
    id: 'founder-story',
    name: 'Founder Story',
    price: extraPrice(PRICING.products['founder-story'].extra),
    per: '',
    founding: FOUNDING_ACTIVE,
    features: ['Editorial profile', 'Homepage feature', 'Social preview'],
    quotePreset: { addExtra: 'founder' },
  },
];
