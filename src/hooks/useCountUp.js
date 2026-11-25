import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Animates a number toward `target` with an ease-out curve.
 * Starts from 0 the first time `start` becomes true, then from the current value.
 */
export function useCountUp(target, { duration = 900, start = true } = {}) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    if (!start) return undefined;
    if (reduced) {
      currentRef.current = target;
      setValue(target);
      return undefined;
    }

    const from = currentRef.current;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const next = from + (target - from) * eased;
      currentRef.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, duration, reduced]);

  return value;
}
