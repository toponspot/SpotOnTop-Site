import { useCallback, useLayoutEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * FLIP animation for reordering lists.
 * Call `register(key)` as each item's ref; pass the current order as `orderKey`.
 */
export function useFlipList(orderKey, { duration = 420 } = {}) {
  const reduced = usePrefersReducedMotion();
  const nodes = useRef(new Map());
  const positions = useRef(new Map());

  useLayoutEffect(() => {
    nodes.current.forEach((node, key) => {
      const next = node.offsetTop;
      const previous = positions.current.get(key);
      if (!reduced && previous !== undefined && previous !== next && node.animate) {
        node.animate(
          [{ transform: `translateY(${previous - next}px)` }, { transform: 'translateY(0)' }],
          { duration, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
        );
      }
      positions.current.set(key, next);
    });
  }, [orderKey, reduced, duration]);

  return useCallback(
    (key) => (node) => {
      if (node) nodes.current.set(key, node);
      else nodes.current.delete(key);
    },
    [],
  );
}
