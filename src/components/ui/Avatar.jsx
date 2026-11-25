import { cn } from '../../utils/cn';

/*
  One sample colour per brand, softened: yellow, lavender, coral, teal. Initials in dark text.
  The `tone` keys are what the brand data uses; only the colours behind them changed.
*/
const TONES = {
  gold: 'bg-[#FFC72C] text-[#262624]',
  iris: 'bg-[#9A94E8] text-[#262624]',
  coral: 'bg-[#F0647A] text-[#262624]',
  mint: 'bg-[#3CCFA8] text-[#262624]',
  slate: 'bg-ink-750 text-fg',
  forest: 'bg-[#FFC72C] text-[#262624]',
};

const SIZES = {
  sm: 'h-10 w-10 text-xs font-extrabold',
  md: 'h-12 w-12 text-base font-extrabold',
  lg: 'h-14 w-14 rounded-full text-sm font-extrabold sm:h-16 sm:w-16',
};

export function Avatar({ initials, tone = 'slate', size = 'lg', className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center font-sans', TONES[tone], SIZES[size], className)}
    >
      {initials}
    </span>
  );
}

export function initialsFrom(name) {
  const words = String(name).replace(/&/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '–';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
