import { CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const ICONS = { success: CheckCircle2, info: Info };

export function Toaster({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:p-6"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.tone] ?? Info;
        return (
          <div
            key={toast.id}
            role="status"
            className="force-dark pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 border border-line-strong bg-ink-800 px-4 py-3 text-sm text-fg shadow-card"
          >
            <Icon
              aria-hidden="true"
              className={cn('mt-0.5 h-4 w-4 shrink-0', toast.tone === 'success' ? 'text-mint' : 'text-gold')}
            />
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="-mr-1 p-0.5 text-fg-subtle hover:text-fg"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
