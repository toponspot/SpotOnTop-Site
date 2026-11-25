import { cn } from '../../utils/cn';

/**
 * Spot On Top wordmark: ascending bars with the yellow dot (#FFC72C),
 * "SpotOnTop" in Plus Jakarta Sans 800 with a yellow "On". The tagline is optional.
 */
export function Logo({ className, showTagline = false, compact = false }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 34 30" aria-hidden="true" className={cn('w-auto shrink-0 transition-[height] duration-300', compact ? 'h-[22px]' : 'h-[26px]')}>
        <rect x="0" y="19" width="7.5" height="10" className="fill-fg-subtle" />
        <rect x="10.5" y="13" width="7.5" height="16" className="fill-fg-muted" />
        <rect x="21.5" y="9" width="8" height="20" className="fill-fg" />
        <circle cx="25.5" cy="3.4" r="3.4" fill="#FFC72C" />
      </svg>
      <span className="flex flex-col">
        <span className="text-[21px] font-extrabold leading-none tracking-[-0.03em] text-fg">
          Spot<span className="text-accent">On</span>Top
        </span>
        {showTagline && (
          <span className="mt-[3px] text-[6.5px] font-bold uppercase leading-none tracking-[0.42em] text-fg-muted">
            Be seen on top.
          </span>
        )}
      </span>
      <span className="sr-only">Spot On Top</span>
    </span>
  );
}
