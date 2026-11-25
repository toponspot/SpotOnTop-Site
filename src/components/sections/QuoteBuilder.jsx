import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';
import { useSettings } from '../../context/SettingsContext';
import { useApiMutation } from '../../hooks/useApiMutation';
import { usesDemoData } from '../../config/api.config';
import { cn } from '../../utils/cn';
import { addMonths, FOUNDING_LOCK_TEXT, gstLabel, TAXES_AS_APPLICABLE, toDateString } from '../../utils/quote';
import { QuoteRequestModal } from '../modals/QuoteRequestModal';
import { ErrorState, Skeleton } from '../ui/AsyncState';
import { Button } from '../ui/Button';
import { TextField } from '../ui/Field';
import { Landmark } from '../ui/Landmarks';
import { Odometer } from '../ui/Odometer';
import { Section } from '../ui/Section';
import { Kicker, SectionHeader } from '../ui/SectionHeader';
import { SegmentedControl } from '../ui/SegmentedControl';


function StepCard({ number, title, children }) {
  return (
    <fieldset className="grid gap-4 rounded-sm border border-line bg-ink-800 p-5 sm:p-6 xl:flex-1 xl:content-center 2xl:grid-cols-[236px_minmax(0,1fr)] 2xl:gap-5">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-center gap-3 self-start 2xl:pt-1.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong text-[10px] font-bold text-accent">
          {String(number).padStart(2, '0')}
        </span>
        <span className="text-lg font-bold text-fg sm:text-xl" aria-hidden="true">
          {title}
        </span>
      </div>
      <div className="min-w-0">{children}</div>
    </fieldset>
  );
}

function ChoiceIndicator({ checked }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
        checked ? 'border-gold bg-gold' : 'border-line-strong',
      )}
    >
      {checked && <Check className="h-3 w-3 text-navy" strokeWidth={3.5} />}
    </span>
  );
}

function ChoiceCard({ role = 'radio', checked, onClick, className, children }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-sm border px-3.5 py-3 text-left transition-colors',
        checked ? 'border-gold bg-gold/[0.07]' : 'border-line bg-ink-900 hover:border-line-strong',
        className,
      )}
    >
      {children}
    </button>
  );
}

function QuoteBuilderContent() {
  const { formatPrice, currency, foundingActive, lockMonths } = useSettings();
  const { quote, catalog, breakdown, updateQuote, toggleExtra, highlightKey } = useQuote();
  const quoteRequest = useApiMutation('requestQuote'); // POST /quotes
  const placementOptions = catalog.placements.map((slot) => ({ value: slot.id, label: slot.shortName }));
  const [brandError, setBrandError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [reference, setReference] = useState('');
  const [lockDates, setLockDates] = useState({});
  const [flash, setFlash] = useState(false);
  const brandRef = useRef(null);

  useEffect(() => {
    if (!highlightKey) return undefined;
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 1600);
    return () => window.clearTimeout(id);
  }, [highlightKey]);

  const requestQuote = async () => {
    if (!quote.brandName.trim()) {
      setBrandError('Add your brand name to request a quote.');
      brandRef.current?.focus();
      return;
    }
    // Bookings made at the founding rate store a start date and a lock end date.
    const startDate = new Date();
    const lock = foundingActive
      ? { startDate: toDateString(startDate), lockEndDate: toDateString(addMonths(startDate, lockMonths)) }
      : {};
    try {
      const response = await quoteRequest.mutate({
        brandName: quote.brandName.trim(),
        slotId: quote.slotId,
        months: quote.months,
        audienceId: quote.audienceId,
        extras: quote.extras,
        estimate: { subtotal: breakdown.subtotal, gst: breakdown.gst, total: breakdown.total, currency },
        ...lock,
      });
      setReference(response?.reference ?? 'Draft quote');
      setLockDates(lock);
      setModalOpen(true);
    } catch {
      // quoteRequest.error is shown under the button
    }
  };

  const { slot, duration, audience } = breakdown;
  const slotLabel = [slot.shortName, duration.label, audience.multiplier !== 1 ? audience.label : null]
    .filter(Boolean)
    .join(' · ');
  const share = (value) => `${(value / breakdown.total) * 100}%`;

  return (
    <>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:items-stretch 2xl:grid-cols-[minmax(0,1020px)_minmax(0,540px)] 2xl:justify-between">
        <div className="space-y-4 xl:flex xl:flex-col xl:space-y-0 xl:gap-4">
          <StepCard number={1} title="Where it appears">
            <div className="-mx-1 overflow-x-auto px-1 scrollbar-none">
              <SegmentedControl
                label="Placement"
                options={placementOptions}
                value={quote.slotId}
                onChange={(slotId) => updateQuote({ slotId })}
                tone="light"
                shape="rounded"
                stretch
                className="min-w-[440px]"
                itemClassName="h-9 text-xs sm:text-[13px]"
              />
            </div>
            <TextField
              ref={brandRef}
              id="quote-brand"
              className="mt-4"
              label="Brand name"
              placeholder="Your brand"
              value={quote.brandName}
              maxLength={40}
              autoComplete="organization"
              error={brandError}
              onChange={(event) => {
                updateQuote({ brandName: event.target.value });
                if (brandError && event.target.value.trim()) setBrandError('');
              }}
            />
          </StepCard>

          <StepCard number={2} title="How long">
            <div role="radiogroup" aria-label="Campaign duration" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {catalog.durations.map((option) => (
                <ChoiceCard
                  key={option.months}
                  checked={quote.months === option.months}
                  onClick={() => updateQuote({ months: option.months })}
                  className="py-4"
                >
                  <span>
                    <span className="block text-sm font-bold text-fg">{option.label}</span>
                    <span className={cn('mt-0.5 block text-xs', String(option.note).startsWith('Save') ? 'font-semibold text-mint-ink' : 'text-fg-muted')}>{option.note}</span>
                  </span>
                </ChoiceCard>
              ))}
            </div>
          </StepCard>

          <StepCard number={3} title="Who should see it">
            <div role="radiogroup" aria-label="Audience" className="grid gap-3 sm:grid-cols-3">
              {catalog.audiences.map((option) => (
                <ChoiceCard
                  key={option.id}
                  checked={quote.audienceId === option.id}
                  onClick={() => updateQuote({ audienceId: option.id })}
                >
                  <span className="flex shrink-0 items-center gap-1">
                    {option.flags.map((country) => (
                      <Landmark key={country} country={country} className={cn(option.flags.length > 1 ? 'h-5 w-5' : 'h-6 w-6', quote.audienceId === option.id ? 'text-accent' : 'text-fg-subtle')} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold leading-tight text-fg">{option.label}</span>
                    <span className="block text-xs text-fg-muted">×{option.multiplier} reach multiplier</span>
                  </span>
                  <ChoiceIndicator checked={quote.audienceId === option.id} />
                </ChoiceCard>
              ))}
            </div>
          </StepCard>

          <StepCard number={4} title="Extras">
            <div role="group" aria-label="Extras" className="grid gap-3 sm:grid-cols-3">
              {catalog.extras.map((extra) => {
                const checked = quote.extras.includes(extra.id);
                return (
                  <ChoiceCard key={extra.id} role="checkbox" checked={checked} onClick={() => toggleExtra(extra.id)}>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-fg">{extra.label}</span>
                      <span className="block text-xs text-fg-muted">
                        +{formatPrice(extra.price)}
                        {extra.recurring ? ' / month' : ''}
                      </span>
                    </span>
                    <ChoiceIndicator checked={checked} />
                  </ChoiceCard>
                );
              })}
            </div>
          </StepCard>
        </div>

        <aside
          aria-labelledby="estimate-title"
          className={cn(
            'rounded-sm border bg-ink-950 p-5 shadow-card transition-[box-shadow,border-color] duration-500 sm:p-6 xl:sticky xl:top-28',
            flash ? 'border-gold shadow-glow' : 'border-line',
          )}
        >
          <Kicker as="h3" className="text-[11px]">
            <span id="estimate-title">Your estimate</span>
          </Kicker>

          <div className="mt-5 rounded-xl bg-ink-750 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="bg-ink-850 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-fg-muted">
                Sponsored preview
              </span>
              <span className="rounded-md bg-gold px-2.5 py-1 text-[10px] font-bold text-navy">{slot.name}</span>
            </div>
            <p className="mt-4 break-words font-sans text-[28px] font-extrabold leading-tight text-fg sm:text-[32px]">
              {quote.brandName.trim() || 'Your brand'}
            </p>
            <p className="mt-1 text-sm text-fg-muted">{slot.name}</p>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <p className="text-sm text-fg-muted">Estimated total</p>
            <p className="mt-1 font-sans text-[40px] font-extrabold leading-tight tabular-nums tracking-tight text-accent sm:text-[48px]" aria-live="polite">
              <Odometer text={formatPrice(breakdown.total)} />
            </p>
            <p className="text-sm text-fg-muted">
              {breakdown.taxesAsApplicable ? TAXES_AS_APPLICABLE : 'Including GST'} · demo price
            </p>
            {foundingActive && (
              <p className="mt-3 border border-gold/70 px-2.5 py-1.5 text-[11px] font-bold leading-snug text-accent">
                {FOUNDING_LOCK_TEXT(lockMonths)}
              </p>
            )}
          </div>

          <div className="mt-6 flex h-1.5 overflow-hidden bg-line" aria-hidden="true">
            <span className="h-full bg-gold transition-[width] duration-500" style={{ width: share(breakdown.slotTotal) }} />
            <span className="h-full bg-iris transition-[width] duration-500" style={{ width: share(breakdown.extrasTotal) }} />
            <span className="h-full bg-line-strong transition-[width] duration-500" style={{ width: share(breakdown.gst) }} />
          </div>
          <div className="mt-3 flex gap-4 text-[11px] text-fg-muted" aria-hidden="true">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-gold" />Slot</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-iris" />Extras</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-line-strong" />GST</span>
          </div>

          <dl className="mt-5 divide-y divide-line text-sm">
            <div className="flex items-center justify-between gap-3 py-2.5">
              <dt className="text-fg-muted">{slotLabel}</dt>
              <dd className="font-bold text-fg"><Odometer text={formatPrice(breakdown.slotTotal)} /></dd>
            </div>
            {breakdown.extraLines.map((extra) => (
              <div key={extra.id} className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-fg-muted">{extra.label}</dt>
                <dd className="font-bold text-fg"><Odometer text={formatPrice(extra.price)} /></dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 py-2.5">
              <dt className="text-fg-muted">
                {breakdown.taxesAsApplicable ? TAXES_AS_APPLICABLE : gstLabel(breakdown.gstRate)}
              </dt>
              {!breakdown.taxesAsApplicable && (
                <dd className="font-bold text-fg"><Odometer text={formatPrice(breakdown.gst)} /></dd>
              )}
            </div>
          </dl>

          {quoteRequest.error && (
            <p role="alert" className="mt-4 text-center text-sm font-semibold text-coral-ink">
              {quoteRequest.error.message || 'The quote request failed. Please try again.'}
            </p>
          )}
          <Button className="mt-5 w-full" size="lg" onClick={requestQuote} disabled={quoteRequest.isLoading}>
            {quoteRequest.isLoading ? 'Requesting…' : 'Request quote'}
          </Button>
          <p className="mt-3 text-center text-xs text-fg-muted">
            {usesDemoData('requestQuote')
              ? 'Demo only. No inventory is reserved and nothing is sent.'
              : 'We reply within one working day. Nothing is reserved until you confirm.'}
          </p>
        </aside>
      </div>

      <QuoteRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reference={reference}
        brandName={quote.brandName.trim()}
        breakdown={breakdown}
        lockDates={lockDates}
      />
    </>
  );
}

export function QuoteBuilder() {
  // Catalog = GET /slots + GET /quote-options + GET /settings (loaded in QuoteContext).
  const { catalog, breakdown, error, retry } = useQuote();
  return (
    <Section id="quote-builder" tone={900} aria-labelledby="quote-title">
      <SectionHeader
        eyebrow="Quote builder"
        title="Build your campaign."
        accent="campaign."
        titleId="quote-title"
        description="Make four choices and see the estimate respond immediately. Nothing is sent or reserved in this demo."
      />
      {catalog && breakdown ? (
        <QuoteBuilderContent />
      ) : error ? (
        <ErrorState error={error} onRetry={retry} title="Couldn’t load the quote builder." />
      ) : (
        <div role="status" aria-label="Loading quote builder" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div className="space-y-4">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-32 rounded-sm" />
            ))}
          </div>
          <Skeleton className="min-h-[560px] rounded-sm" />
        </div>
      )}
    </Section>
  );
}
