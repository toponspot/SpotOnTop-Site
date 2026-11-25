import { cn } from '../../utils/cn';

/** Blinking red LIVE dot. Opacity-only animation; it holds still with reduced motion. */
export function LiveDot({ className }) {
  return <span aria-hidden="true" className={cn('inline-block h-2 w-2 animate-pulse-dot rounded-full bg-coral', className)} />;
}
