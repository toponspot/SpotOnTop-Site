import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Eases a live counter from its old value to the new one (ease-out, 800 ms by default).
 * The first value is shown straight away, so a counter never starts from 0.
 * Returns `undefined` while `target` is undefined. Round the result before showing it.
 */
export function useEasedNumber(target, { duration = 800 } = {}) {
    const reduced = usePrefersReducedMotion();
    const [value, setValue] = useState(target);
    const currentRef = useRef(target);

    useEffect(() => {
        const from = currentRef.current;
        if (reduced || target === undefined || from === undefined || from === target) {
            currentRef.current = target;
            setValue(target);
            return undefined;
        }

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
    }, [target, reduced, duration]);

    return value ?? target;
}