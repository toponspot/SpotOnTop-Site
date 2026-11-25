import { useCallback, useRef, useState } from 'react';
import { HOW_IT_WORKS_STEPS, STEP_DURATION_MS } from '../../../config/steps';
import { useQuote } from '../../../context/QuoteContext';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useInView } from '../../../hooks/useInView';
import { useInterval } from '../../../hooks/useInterval';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';
import { cn } from '../../../utils/cn';
import { Skeleton } from '../../ui/AsyncState';
import { Section } from '../../ui/Section';
import { SectionHeader } from '../../ui/SectionHeader';
import { AddBrandPanel, ChooseSpotPanel, LivePanel, QuotePanel, walkthroughSlots } from './StepPanels';

const TICK_MS = 100;


/**
 * Four-step walkthrough. Advances on its own while visible, pauses while the
 * visitor hovers or works inside it, and never auto-advances with reduced motion.
 */
export function HowItWorks() {
  const reduced = usePrefersReducedMotion();
  const [sectionRef, inView] = useInView({ threshold: 0.3, once: false });
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { catalog } = useQuote(); // slots + quote options from the API
  const profileQuery = useApiQuery('brandProfile'); // GET /brand-profile
  const profile = profileQuery.data;
  const [chosenSlotId, setSlotId] = useState(null);
  const [brandEdits, setBrand] = useState(null);

  // Walkthrough defaults come from the API; the visitor's edits override them.
  const walkthrough = walkthroughSlots(catalog?.slots);
  const slotId = chosenSlotId ?? (walkthrough[1] ?? walkthrough[0])?.id ?? null;
  const brand = brandEdits ?? {
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    contactCard: [profile?.contactName, profile?.phone].filter(Boolean).join(' · '),
  };
  const progressRef = useRef(0);

  const running = inView && !hovered && !focused && !reduced;

  // Progress lives in a ref so the step change happens outside any state updater.
  const advance = useCallback(() => {
    const next = progressRef.current + TICK_MS / STEP_DURATION_MS;
    if (next >= 1) {
      progressRef.current = 0;
      setProgress(0);
      setActiveIndex((index) => (index + 1) % HOW_IT_WORKS_STEPS.length);
    } else {
      progressRef.current = next;
      setProgress(next);
    }
  }, []);

  useInterval(advance, running ? TICK_MS : null);

  const selectStep = (index) => {
    setActiveIndex(index);
    progressRef.current = 0;
    setProgress(0);
  };

  const activeStep = HOW_IT_WORKS_STEPS[activeIndex];

  return (
    <Section id="how-it-works" tone={900} aria-labelledby="how-title">
      <SectionHeader
        eyebrow="How it works"
        title="From empty slot to live campaign."
        accent="live campaign."
        titleId="how-title"
        description="Four simple steps, one connected workflow. The story advances automatically, or choose a step to explore it."
      />

      <div
        ref={sectionRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        className="grid gap-6 border border-line bg-ink-800 p-4 sm:p-6 lg:grid-cols-[minmax(0,578fr)_minmax(0,827fr)] lg:gap-x-10 lg:p-7 xl:gap-x-14 xl:pr-14 2xl:gap-x-[77px] 2xl:pr-[90px]"
      >
        <div role="tablist" aria-label="Booking steps" aria-orientation="vertical" className="flex flex-col gap-3 lg:gap-4">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const active = index === activeIndex;
            // Steps already played stay lit with a full gold bar; upcoming steps stay dim.
            const done = index < activeIndex;
            const lit = active || done;
            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                id={`how-tab-${step.id}`}
                aria-selected={active}
                aria-controls="how-panel"
                onClick={() => selectStep(index)}
                className={cn(
                  'relative overflow-hidden rounded-xl border px-5 py-4 text-left transition-colors sm:py-5',
                  lit && 'pb-8 sm:pb-9',
                  active && 'border-gold bg-ink-800',
                  done && 'border-ink-800 bg-ink-800',
                  !lit && 'border-line bg-transparent hover:border-line-strong',
                )}
              >
                <span className="flex items-baseline gap-4">
                  <span className={cn('w-5 shrink-0 text-xs font-bold text-accent', !lit && 'opacity-60')}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className={cn('block text-base font-bold sm:text-lg', lit ? 'text-fg' : 'text-fg-subtle')}>
                      {step.title}
                    </span>
                    <span className={cn('mt-1.5 block text-[13px] leading-relaxed', lit ? 'text-fg-muted' : 'text-fg-subtle')}>
                      {step.description}
                    </span>
                  </span>
                </span>
                {lit && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-5 bottom-3.5 h-1 overflow-hidden rounded-full bg-line"
                  >
                    <span
                      className="block h-full origin-left rounded-full bg-gradient-to-r from-[#F2B100] to-[#FFD24D] transition-transform duration-100 ease-linear"
                      style={{ transform: `scaleX(${done || reduced ? 1 : progress})` }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          id="how-panel"
          role="tabpanel"
          aria-labelledby={`how-tab-${activeStep.id}`}
          className="min-w-0"
        >
          <p className="caps text-[11px] font-extrabold leading-7 text-accent sm:text-xs lg:mt-[18px] xl:text-[13px]">
            Step {activeIndex + 1} · {activeStep.panelTitle}
          </p>
          {/*
            xl:h-[320px] gives every step's box the same fixed size.
            Each panel fills it (xl:h-full) instead of deciding the box height itself.
          */}
          <div
            key={activeStep.id}
            className="mt-4 animate-rise-in px-0 py-2 sm:py-4 lg:mt-[26px] xl:h-[320px] xl:py-0"
          >
            {!catalog && <Skeleton className="h-80 w-full" />}
            {catalog && activeStep.id === 'choose' && (
              <ChooseSpotPanel slots={catalog.slots} selectedSlotId={slotId} onSelect={setSlotId} />
            )}
            {catalog && activeStep.id === 'brand' && <AddBrandPanel brand={brand} onChange={setBrand} />}
            {catalog && activeStep.id === 'quote' && <QuotePanel slotId={slotId} />}
            {catalog && activeStep.id === 'live' && <LivePanel />}
          </div>
        </div>
      </div>
    </Section>
  );
}