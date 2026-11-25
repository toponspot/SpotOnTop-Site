import { CircleDollarSign, FileText, MessageSquareText, Radio } from 'lucide-react';
import { useQuote } from '../../../context/QuoteContext';
import { useSettings } from '../../../context/SettingsContext';
import { calculateQuote, gstLabel, TAXES_AS_APPLICABLE } from '../../../utils/quote';
import { cn } from '../../../utils/cn';
import { Badge } from '../../ui/Badge';
import { inputClasses, inputSurfaces } from '../../ui/Field';
import { FoundingBadge } from '../../ui/FoundingBadge';

/** Slots flagged `showInWalkthrough` by the API, or the first three quotable ones. */
export function walkthroughSlots(slots = []) {
  const flagged = slots.filter((slot) => slot.showInWalkthrough);
  return (flagged.length ? flagged : slots.filter((slot) => slot.quotable)).slice(0, 3);
}

/* ── Step 1 · Choose a spot ─────────────────────────────────────────────── */

export function ChooseSpotPanel({ slots, selectedSlotId, onSelect }) {
  const { formatPrice } = useSettings();
  return (
    <div role="radiogroup" aria-label="Demo placements" className="space-y-3 sm:space-y-4 xl:flex xl:h-full xl:flex-col xl:space-y-0 xl:gap-[15px]">
      {walkthroughSlots(slots).map((slot) => {
        const selected = slot.id === selectedSlotId;
        const subtitle =
          slot.places > 1 ? `Rotating, ${slot.taken} of ${slot.places} places taken` : slot.description;
        return (
          <button
            key={slot.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(slot.id)}
            className={cn(
              // Design: unselected rows are plain #262624; the selected row gets a 6% yellow tint
              // and a dashed 1px yellow outline.
              'group relative flex w-full flex-col gap-3 border border-transparent px-4 py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-6 xl:flex-1 xl:py-1.5',
              selected ? 'bg-gold/[0.06]' : 'bg-ink-900',
            )}
          >
            {/* SVG outline gives an even 4px dash / 4px gap, which CSS border-dashed cannot. */}
            <svg aria-hidden="true" className="pointer-events-none absolute inset-[0.5px] h-[calc(100%-1px)] w-[calc(100%-1px)] overflow-visible">
              <rect
                width="100%"
                height="100%"
                rx="1.5"
                fill="none"
                strokeWidth="1"
                strokeDasharray="4 4"
                className={cn('transition-colors', selected ? 'stroke-gold' : 'stroke-transparent group-hover:stroke-line-strong')}
              />
            </svg>
            <span className="min-w-0">
              <span className="block text-base font-bold leading-snug text-fg sm:text-lg xl:text-xl">
                {slot.name}
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-fg-muted sm:text-base xl:mt-0 xl:text-lg">{subtitle}</span>
            </span>
            <span className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
              {selected ? (
                <Badge tone="gold" size="card">
                  Selected
                </Badge>
              ) : (
                <Badge tone="open" size="card">
                  {slot.statusLabel}
                </Badge>
              )}
              <span className="whitespace-nowrap text-sm font-bold leading-snug text-fg sm:text-base xl:text-lg tabular">
                {formatPrice(slot.rate)} a month
              </span>
            </span>
          </button>
        );
      })}
      {walkthroughSlots(slots).some((slot) => slot.founding) && (
        <div className="pt-1 xl:pt-0">
          <FoundingBadge />
        </div>
      )}
    </div>
  );
}

/* ── Step 2 · Add your brand ────────────────────────────────────────────── */

function DemoInput({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-fg-muted">
        {label}
      </label>
      <input id={id} className={cn(inputClasses, inputSurfaces.default, 'h-11')} {...props} />
    </div>
  );
}

/** Three fields only: brand name, work email and one combined contact card line. */
export function AddBrandPanel({ brand, onChange }) {
  const update = (field) => (event) => onChange({ ...brand, [field]: event.target.value });
  return (
    <div className="mx-auto grid w-full max-w-[460px] gap-4 xl:h-full xl:content-center">
      <DemoInput id="demo-brand" label="Brand name" value={brand.name} onChange={update('name')} maxLength={40} />
      <DemoInput id="demo-email" label="Work email" type="email" value={brand.email} onChange={update('email')} />
      <DemoInput id="demo-contact" label="Contact card" value={brand.contactCard} onChange={update('contactCard')} maxLength={60} />
    </div>
  );
}

/* ── Step 3 · Get quote ─────────────────────────────────────────────────── */

/** The walkthrough quote is for one month, so the rate, subtotal and total add up on screen. */
const WALKTHROUGH_MONTHS = 1;

function QuoteRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-[3px]">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="truncate text-right font-semibold text-fg">{value}</dd>
    </div>
  );
}

export function QuotePanel({ slotId }) {
  const { formatPrice, currency } = useSettings();
  const { catalog } = useQuote();
  // Base price only: first audience (×1 reach) and no extras.
  const quote = calculateQuote(
    { slotId, months: WALKTHROUGH_MONTHS, audienceId: catalog.audiences[0]?.id, extras: [] },
    catalog,
    currency,
  );

  return (
    <div className="mx-auto w-full max-w-[340px] text-xs xl:flex xl:h-full xl:flex-col xl:justify-center">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-base font-bold text-fg">
          <FileText className="h-4 w-4 text-fg-muted" strokeWidth={1.5} aria-hidden="true" />
          Draft quote
        </p>
        <Badge tone="neutral" size="sm">
          DRAFT
        </Badge>
      </div>
      <p className="mt-1 text-[11px] text-fg-subtle">QT-2026-001 · Advertising booking</p>

      <dl className="mt-3 border-t border-line pt-2.5">
        <QuoteRow label="Selected slot" value={quote.slot.name} />
        <QuoteRow
          label="Campaign duration"
          value={`${quote.duration.months} ${quote.duration.months === 1 ? 'month' : 'months'}`}
        />
        <QuoteRow label="Slot rate" value={`${formatPrice(quote.slotRate)} / month`} />
      </dl>
      <dl className="mt-2.5 border-t border-line pt-2.5">
        <QuoteRow label="Subtotal" value={formatPrice(quote.subtotal)} />
        {quote.taxesAsApplicable ? (
          <QuoteRow label={TAXES_AS_APPLICABLE} value="" />
        ) : (
          <QuoteRow label={gstLabel(quote.gstRate)} value={formatPrice(quote.gst)} />
        )}
      </dl>

      <div className="mt-2.5 flex items-center justify-between gap-3 border border-dashed border-gold/60 bg-gold/[0.07] px-3.5 py-2.5">
        <div>
          <p className="text-[13px] font-semibold text-fg">Quote total</p>
          <p className="text-[10px] text-fg-subtle">{quote.taxesAsApplicable ? TAXES_AS_APPLICABLE : 'Inclusive of all taxes'}</p>
        </div>
        <p className="text-2xl font-extrabold leading-none text-accent tabular">{formatPrice(quote.total)}</p>
      </div>
    </div>
  );
}

/* ── Step 4 · Go live & watch results ───────────────────────────────────── */

const TIMELINE = [
  { title: 'Request Received', note: 'We reply within one working day', Icon: MessageSquareText, circle: 'border-mint/70 text-mint-ink' },
  { title: 'Advance received', note: 'Go-live starts after the advance', Icon: CircleDollarSign, circle: 'border-mint/70 text-mint-ink' },
  { title: 'Banner live', note: 'Sponsored, with your contact card', Icon: Radio, circle: 'border-gold text-accent', live: true },
];

/** Vertical timeline: three outlined status marks joined by a thin green line. */
export function LivePanel() {
  return (
    <div className="xl:flex xl:h-full xl:items-center xl:justify-center">
      <ol className="mx-auto w-fit sm:mx-auto xl:mx-0">
        {TIMELINE.map((item, index) => {
          const isLast = index === TIMELINE.length - 1;
          return (
            <li key={item.title} className={cn('relative flex min-h-[44px] items-center gap-4', !isLast && 'mb-[21px]')}>
              {!isLast && (
                <span aria-hidden="true" className="absolute left-[15.25px] top-[38px] h-[33px] w-px bg-mint/50" />
              )}
              <span className={cn('relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-ink-900', item.circle)}>
                <item.Icon className="h-[16px] w-[16px]" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-base font-bold leading-6 text-fg">
                  {item.title}
                  {item.live && (
                    <span className="inline-flex items-center gap-1.5 border border-coral px-2 py-1 text-[10px] font-bold leading-none tracking-[0.08em] text-coral-ink">
                      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-coral" aria-hidden="true" />
                      LIVE NOW
                    </span>
                  )}
                </p>
                <p className="text-sm leading-5 text-fg-muted">{item.note}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}