import { cn } from '../../utils/cn';

/*
  Status tags: square, outlined, small caps. Green = open / done, blue = booked / USA,
  yellow = selected / pending, red = live. No purple and no bright filled green.
*/
const TONES = {
  open: 'border border-mint/55 text-mint-ink',
  iris: 'border border-iris/60 text-iris-ink',
  gold: 'bg-gold text-navy border border-gold',
  pending: 'border border-gold/70 text-accent',
  done: 'border border-mint/55 text-mint-ink',
  live: 'border border-coral text-coral-ink',
  neutral: 'border border-line-strong text-fg-muted',
};

const BADGE_SIZES = {
  sm: 'px-2 py-[3px] text-[10px]',
  md: 'px-2.5 py-1 text-[11px]',
  lg: 'h-7 px-3 text-[11px] sm:text-xs xl:h-8 xl:px-3.5',
  // Status tag on the "How it works" spot cards: slimmer at xl so three cards fit the fixed-height box.
  card: 'h-6 px-2.5 text-[10px] sm:text-[11px]',
};

const DOTS = {
  open: 'bg-mint',
  iris: 'bg-iris',
  gold: 'bg-navy',
  pending: 'bg-gold',
  done: 'bg-mint',
  live: 'bg-coral',
  neutral: 'bg-fg-subtle',
};

export function Badge({ tone = 'neutral', dot = false, pulse = false, size = 'md', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-bold uppercase tracking-[0.08em]',
        BADGE_SIZES[size],
        TONES[tone],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOTS[tone], pulse && 'animate-pulse-dot')} />}
      {children}
    </span>
  );
}
