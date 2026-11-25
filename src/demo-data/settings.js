/**
 * DEMO DATA · GET /settings
 * Commercial settings from src/config/pricing.json. Prices are stored per currency
 * ({ INR, USD }), so there is no exchange rate. `gstRates.USD` is null: USD quotes show
 * "Taxes as applicable" until the accountant confirms the rule.
 * `founding.active` is true only while pricing mode is "launch".
 */
import { FOUNDING_ACTIVE, PRICING, PRICING_MODE } from './priceBook.js';

export const SETTINGS = {
  pricingMode: PRICING_MODE,
  gstRates: { INR: PRICING.gst.INR, USD: PRICING.gst.USD },
  founding: { active: FOUNDING_ACTIVE, lockMonths: PRICING.founding.lockMonths },
};
