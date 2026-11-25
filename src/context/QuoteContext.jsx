import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useApiQuery } from '../hooks/useApiQuery';
import { calculateQuote } from '../utils/quote';
import { useGoToSection } from '../hooks/useGoToSection';
import { useSettings } from './SettingsContext';

const QuoteContext = createContext(null);

/** Choices the visitor has made. `null` means "use the API's default". */
const INITIAL_CHOICES = { slotId: null, months: null, audienceId: null, extras: null, brandName: '' };

/**
 * The quote builder's configuration and its catalog (slots, durations,
 * audiences, extras, GST) from GET /slots and GET /quote-options. Shared so
 * the banner board, pricing cards and hero can pre-fill it.
 */
export function QuoteProvider({ children }) {
  const { gstRates, currency } = useSettings();
  const goToSection = useGoToSection();
  const slotsQuery = useApiQuery('slots');
  const optionsQuery = useApiQuery('quoteOptions');
  const [choices, setChoices] = useState(INITIAL_CHOICES);
  const [highlightKey, setHighlightKey] = useState(0);

  const options = optionsQuery.data;
  const slots = slotsQuery.data;

  const catalog = useMemo(() => {
    if (!slots || !options || !gstRates) return null;
    const placementIds = options.placements ?? slots.filter((slot) => slot.quotable).map((slot) => slot.id);
    return {
      slots,
      placements: placementIds.map((id) => slots.find((slot) => slot.id === id)).filter(Boolean),
      durations: options.durations ?? [],
      audiences: options.audiences ?? [],
      extras: options.extras ?? [],
      defaults: options.defaults ?? {},
      gstRates,
    };
  }, [slots, options, gstRates]);

  const catalogRef = useRef(catalog);
  catalogRef.current = catalog;

  /** Choices with API defaults filled in. */
  const quote = useMemo(() => {
    const defaults = catalog?.defaults ?? {};
    return {
      slotId: choices.slotId ?? defaults.slotId ?? catalog?.placements[0]?.id ?? null,
      months: choices.months ?? defaults.months ?? catalog?.durations[0]?.months ?? null,
      audienceId: choices.audienceId ?? defaults.audienceId ?? catalog?.audiences[0]?.id ?? null,
      extras: choices.extras ?? defaults.extras ?? [],
      brandName: choices.brandName,
    };
  }, [choices, catalog]);

  const updateQuote = useCallback((patch) => setChoices((current) => ({ ...current, ...patch })), []);

  const toggleExtra = useCallback(
    (extraId) =>
      setChoices((current) => {
        const active = current.extras ?? catalogRef.current?.defaults?.extras ?? [];
        return {
          ...current,
          extras: active.includes(extraId) ? active.filter((id) => id !== extraId) : [...active, extraId],
        };
      }),
    [],
  );

  /** Applies a preset ({ slotId, brandName, addExtra }), scrolls to the builder and flashes the estimate. */
  const openQuoteBuilder = useCallback((preset = {}) => {
    setChoices((current) => {
      const next = { ...current };
      const placements = catalogRef.current?.placements;
      if (preset.slotId && (!placements || placements.some((slot) => slot.id === preset.slotId))) {
        next.slotId = preset.slotId;
      }
      if (preset.brandName?.trim()) next.brandName = preset.brandName.trim();
      if (preset.addExtra) {
        const active = current.extras ?? catalogRef.current?.defaults?.extras ?? [];
        if (!active.includes(preset.addExtra)) next.extras = [...active, preset.addExtra];
      }
      return next;
    });
    setHighlightKey((key) => key + 1);
    goToSection('quote-builder');
  }, []);

  const breakdown = useMemo(() => calculateQuote(quote, catalog, currency), [quote, catalog, currency]);

  const { error: slotsError, refetch: refetchSlots } = slotsQuery;
  const { error: optionsError, refetch: refetchOptions } = optionsQuery;
  const error = slotsError || optionsError;
  const retry = useCallback(() => {
    if (slotsError) refetchSlots().catch(() => { });
    if (optionsError) refetchOptions().catch(() => { });
  }, [slotsError, optionsError, refetchSlots, refetchOptions]);

  const value = useMemo(
    () => ({ quote, catalog, breakdown, updateQuote, toggleExtra, openQuoteBuilder, highlightKey, error, retry }),
    [quote, catalog, breakdown, updateQuote, toggleExtra, openQuoteBuilder, highlightKey, error, retry],
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) throw new Error('useQuote must be used inside <QuoteProvider>.');
  return context;
}
