import { AlertTriangle, RotateCw } from 'lucide-react';
import { cn } from '../../utils/cn';

/** Pulsing placeholder shown while data loads. */
export function Skeleton({ className }) {
  return <span aria-hidden="true" className={cn('block animate-pulse bg-ink-750/70', className)} />;
}

/** Message + retry button shown when a request fails. */
export function ErrorState({ error, onRetry, title = 'Couldn’t load this section.', className }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 border border-dashed border-line-strong px-6 py-10 text-center',
        className,
      )}
    >
      <AlertTriangle className="h-6 w-6 text-coral" strokeWidth={1.5} aria-hidden="true" />
      <div>
        <p className="font-bold text-fg">{title}</p>
        {error?.message && <p className="mt-1 text-sm text-fg-muted">{error.message}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={() => onRetry()}
          className="caps inline-flex h-9 items-center gap-2 border border-line-strong px-4 text-[11px] font-extrabold text-fg transition-colors hover:border-gold"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}

/**
 * Renders loading → error → content for a useApiQuery result.
 * `children` is a function receiving the data.
 */
export function QueryState({ query, skeleton, errorTitle, className, children }) {
  if (query.data !== undefined) return children(query.data);
  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} title={errorTitle} className={className} />;
  return (
    <div role="status" aria-busy="true" aria-label="Loading" className={className}>
      {skeleton ?? <Skeleton className="h-48 w-full" />}
    </div>
  );
}
