import { cn } from '../../utils/cn';

/** Verification seal for sponsored creatives (bottom right of the hero billboard). */
export function VerificationSeal({ className, label = 'Verified placement' }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn('inline-flex h-9 w-9 items-center justify-center bg-[#262624]/85 backdrop-blur-sm', className)}
    >
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" aria-hidden="true">
        <path d="M12 2.5l7.5 3v5.6c0 4.5-3.1 8.3-7.5 10.4-4.4-2.1-7.5-5.9-7.5-10.4V5.5z" stroke="#FFC72C" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8.4 12.2l2.5 2.5 4.7-5" stroke="#FFC72C" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
