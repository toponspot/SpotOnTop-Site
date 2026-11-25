import { cn } from '../../utils/cn';

/*
  Landmark icons that replace the round flags: Statue of Liberty (USA) and Gateway of India (India).
  One thin-line set (1.5 px stroke) on a 32 px grid, with a yellow accent dot.
*/

const base = {
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function StatueOfLiberty({ className }) {
  return (
    <svg {...base} className={cn('h-6 w-6 shrink-0', className)}>
      <path d="M9.5 30h13v-4h-13z" />
      <path d="M12 26l1.2-9.5h5.6L20 26" />
      <circle cx="16" cy="13.2" r="2.1" />
      <path d="M16 11.1V8.6M14.1 11.7l-1.6-1.8M17.9 11.7l1.6-1.8" />
      <path d="M18.8 16.5L22 7.2" />
      <path d="M13.2 17.4l-2.6 1.6" />
      <path d="M20.6 7.2h2.8" />
      <circle cx="22.2" cy="4.2" r="1.3" fill="#FFC72C" stroke="none" />
    </svg>
  );
}

export function GatewayOfIndia({ className }) {
  return (
    <svg {...base} className={cn('h-6 w-6 shrink-0', className)}>
      <path d="M3.5 29h25" />
      <path d="M6 29V14h20v15" />
      <path d="M12 29v-8a4 4 0 0 1 8 0v8" />
      <path d="M12.2 14a3.8 3.8 0 0 1 7.6 0" />
      <path d="M6 14v-3.2h3V14M23 14v-3.2h3V14" />
      <path d="M6.6 10.8a.9.9 0 0 1 1.8 0M23.6 10.8a.9.9 0 0 1 1.8 0" />
      <circle cx="16" cy="7.4" r="1.3" fill="#FFC72C" stroke="none" />
    </svg>
  );
}

const MAP = { usa: StatueOfLiberty, india: GatewayOfIndia };

/** `country` is "usa" or "india", the same keys the old <Flag> used. */
export function Landmark({ country, className }) {
  const Icon = MAP[country];
  return Icon ? <Icon className={className} /> : null;
}

/** The two landmarks side by side, for "Two Markets, One Audience". */
export function LandmarkPair({ className, iconClassName }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <GatewayOfIndia className={cn('h-5 w-5', iconClassName)} />
      <StatueOfLiberty className={cn('h-5 w-5', iconClassName)} />
    </span>
  );
}
