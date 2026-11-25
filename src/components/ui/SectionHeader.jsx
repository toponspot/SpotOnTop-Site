import { cn } from '../../utils/cn';

/** Splits `title` so `accent` (the last matching phrase) is yellow and upright. */
function withAccent(title, accent) {
  if (!accent || typeof title !== 'string') return title;
  const at = title.lastIndexOf(accent);
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <span className="text-accent">{accent}</span>
      {title.slice(at + accent.length)}
    </>
  );
}

/**
 * Section heading block. Headline is Plus Jakarta Sans 800 (44px in the design, which the
 * 80% page scale shows as 44px on a 1280 screen); accent words are yellow, never italic.
 */
export function SectionHeader({ eyebrow, badge, title, accent, titleId, description, aside, className }) {
  return (
    <div className={cn('mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="max-w-[78rem]">
        <div className="flex flex-wrap items-center gap-3">
          <p className="caps text-[11px] font-extrabold text-accent sm:text-xs">{eyebrow}</p>
          {badge}
        </div>
        <h2
          id={titleId}
          className="mt-4 text-[32px] font-extrabold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[40px] lg:text-[55px]"
        >
          {withAccent(title, accent)}
        </h2>
        {description && (
          <p className="mt-5 max-w-[60rem] text-base leading-relaxed text-fg-muted sm:text-lg lg:text-xl">{description}</p>
        )}
      </div>
      {aside}
    </div>
  );
}

/** Small caps label used inside cards ("SPOT OF THE WEEK", "YOUR ESTIMATE"). */
export function Kicker({ as: Component = 'p', className, children }) {
  return (
    <Component className={cn('caps text-[10.5px] font-extrabold text-accent sm:text-[11px]', className)}>{children}</Component>
  );
}
