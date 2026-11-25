import { QuoteProvider } from './QuoteContext';
import { SettingsProvider } from './SettingsContext';
import { UIProvider } from './UIContext';

export function AppProviders({ children }) {
  return (
    <SettingsProvider>
      <QuoteProvider>
        <UIProvider>{children}</UIProvider>
      </QuoteProvider>
    </SettingsProvider>
  );
}
