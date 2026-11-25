import PRICING from '../config/pricing.json';

/**
 * Reads src/config/pricing.json (the one pricing settings file) and resolves the
 * current "mode" (launch | full). Every other demo-data file gets its prices from here,
 * so no price is typed anywhere else.
 */
export const PRICING_MODE = PRICING.mode === 'full' ? 'full' : 'launch';
export const FOUNDING_ACTIVE = PRICING_MODE === 'launch';

/** { INR, USD } for the current mode. USD is stored in the file, never converted. */
export const priceOf = (entry) => ({ ...entry[PRICING_MODE] });

export const slotPrice = (id) => priceOf(PRICING.slots[id]);
export const extraPrice = (id) => priceOf(PRICING.extras[id]);

export { PRICING };
