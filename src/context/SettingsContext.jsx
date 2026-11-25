import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useApiQuery } from '../hooks/useApiQuery';
import { usePersistentState } from '../hooks/usePersistentState';
import { amountIn, formatMoney } from '../utils/currency';

const SettingsContext = createContext(null);

const isTheme = (value) => value === 'dark' || value === 'light';
const isCurrency = (value) => value === 'INR' || value === 'USD';

/**
 * Theme (dark/light) and display currency (INR/USD), persisted per browser,
 * plus commercial settings (GST per currency, founding offer) from GET /settings.
 * Prices are stored per currency ({ INR, USD }), so the switch never converts.
 */
export function SettingsProvider({ children }) {
  const [theme, setTheme] = usePersistentState('sot:theme', 'dark', isTheme);
  const [currency, setCurrency] = usePersistentState('sot:currency', 'INR', isCurrency);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#1F1F1E' : '#F5F4EE');
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [setTheme],
  );

  const settingsQuery = useApiQuery('appSettings');
  const gstRates = settingsQuery.data?.gstRates;
  const founding = settingsQuery.data?.founding;
  const foundingActive = Boolean(founding?.active);
  const lockMonths = founding?.lockMonths ?? 12;

  /** Formats a { INR, USD } price, or a number that is already in the current currency. */
  const formatPrice = useCallback((price) => formatMoney(amountIn(price, currency), currency), [currency]);
  /** The number behind a { INR, USD } price in the current currency. */
  const priceValue = useCallback((price) => amountIn(price, currency), [currency]);

  const value = useMemo(
    () => ({
      theme, toggleTheme, currency, setCurrency, formatPrice, priceValue,
      gstRates, foundingActive, lockMonths, settingsQuery,
    }),
    [theme, toggleTheme, currency, setCurrency, formatPrice, priceValue, gstRates, foundingActive, lockMonths, settingsQuery],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside <SettingsProvider>.');
  return context;
}
