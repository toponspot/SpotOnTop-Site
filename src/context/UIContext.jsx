import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Toaster } from '../components/ui/Toaster';
import { ContactModal } from '../components/modals/ContactModal';

const UIContext = createContext(null);

/** App-wide toasts and the brand contact card modal. */
export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [contact, setContact] = useState(null);
  const counter = useRef(0);

  const dismissToast = useCallback(
    (id) => setToasts((current) => current.filter((toast) => toast.id !== id)),
    [],
  );

  const showToast = useCallback(
    (message, { tone = 'success', duration = 3600 } = {}) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast],
  );

  const openContact = useCallback((details) => setContact(details), []);
  const closeContact = useCallback(() => setContact(null), []);

  const value = useMemo(() => ({ showToast, openContact }), [showToast, openContact]);

  return (
    <UIContext.Provider value={value}>
      {children}
      <ContactModal contact={contact} onClose={closeContact} />
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used inside <UIProvider>.');
  return context;
}
