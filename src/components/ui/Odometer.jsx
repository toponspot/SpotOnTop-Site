import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../utils/cn';

const DIGITS = '0123456789'.split('');
const ROLL_MS = 400;

function Column({ digit, animate }) {
  return (
    <span className="inline-block h-[1em] w-[0.62em] overflow-hidden align-bottom leading-none" aria-hidden="true">
      <span
        className="flex flex-col items-center"
        style={{
          transform: `translateY(${-digit}em)`,
          transition: animate ? `transform ${ROLL_MS}ms cubic-bezier(0.22, 1, 0.36, 1)` : 'none',
        }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="block h-[1em] leading-none">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Rolling-digit number for money. `text` is the already formatted amount (₹2,69,040).
 * Digits roll with transform only (400 ms); symbols and separators stay still.
 * Screen readers get the plain text; the rolling columns are hidden from them.
 */
export function Odometer({ text, className }) {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const first = useRef(true);

  // The first paint shows the value straight away; later changes roll.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      setReady(true);
    }
  }, []);

  // Keyed from the right so a digit keeps its column when the number gets longer or shorter.
  const chars = Array.from(String(text));
  const keys = chars.map((_, index) => chars.length - index);

  return (
    <span className={cn('inline-flex items-end tabular-nums', className)}>
      <span className="sr-only">{text}</span>
      {chars.map((char, index) =>
        /\d/.test(char) ? (
          <Column key={keys[index]} digit={Number(char)} animate={ready && !reduced} />
        ) : (
          <span key={keys[index]} className="inline-block leading-none" aria-hidden="true">
            {char}
          </span>
        ),
      )}
    </span>
  );
}
