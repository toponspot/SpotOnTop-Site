import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

/** useState that survives reloads via localStorage. `isValid` guards stale values. */
export function usePersistentState(key, initialValue, isValid = () => true) {
  const [state, setState] = useState(() => {
    const stored = readStorage(key, initialValue);
    return isValid(stored) ? stored : initialValue;
  });

  useEffect(() => {
    writeStorage(key, state);
  }, [key, state]);

  return [state, setState];
}
