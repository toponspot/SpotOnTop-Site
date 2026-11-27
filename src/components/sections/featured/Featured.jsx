import { useCallback, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useUI } from '../../../context/UIContext';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useInView } from '../../../hooks/useInView';
import { useInterval } from '../../../hooks/useInterval';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';
import { cn } from '../../../utils/cn';
import { formatNumber } from '../../../utils/currency';
import { Avatar } from '../../ui/Avatar';
import { Section } from '../../ui/Section';
import { Kicker, SectionHeader } from '../../ui/SectionHeader';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { CREATIVES, ImageCreative } from './Creatives';
import { QueryState, Skeleton } from '../../ui/AsyncState';

const SLIDE_MS = 7000;
const TICK_MS = 100;

const COMPARE_OPTIONS = [
  { value: 'typical', label: 'Typical promotion' },
  { value: 'spotOn', label: 'On Spot On' },
];

function FeaturedContent({ slides, spotOfTheWeek, comparison }) {
  const { openContact } = useUI();
  const reduced = usePrefersReducedMotion();
  const [carouselRef, inView] = useInView({ threshold: 0.35, once: false });
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [compare, setCompare] = useState('typical');
  const progressRef = useRef(0);
  const slidesCount = useRef(slides.length);
  slidesCount.current = slides.length;

  const running = inView && !paused && !reduced;

  const tick = useCallback(() => {
    const next = progressRef.current + TICK_MS / SLIDE_MS;
    if (next >= 1) {
      progressRef.current = 0;
      setProgress(0);
      setActiveIndex((index) => (index + 1) % slidesCount.current);
    } else {
      progressRef.current = next;
      setProgress(next);
    }
  }, []);

  useInterval(tick, running ? TICK_MS : null);

  const goTo = (index) => {
    progressRef.current = 0;
    setProgress(0);
    setActiveIndex(index);
  };

  const slide = slides[activeIndex] ?? slides[0];
  const Creative = CREATIVES[slide.kind];
  const showContact = () =>
    openContact({ brand: slide.brand, city: slide.city, pitch: slide.pitch, ...slide.contact });

  return (
    <>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)] 2xl:grid-cols-[minmax(0,1020px)_minmax(0,546px)] 2xl:justify-between">
        <div
          ref={carouselRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Sponsored brands this week"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
          }}
        >
          <div
            id="featured-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${activeIndex + 1} of ${slides.length}: ${slide.brand}`}
            className="relative aspect-[1662/889] overflow-hidden rounded-sm bg-ink-800 shadow-card sm:rounded-sm"
          >
            <div key={slide.id} className="h-full w-full animate-fade-in">
              {slide.imageUrl ? (
                <ImageCreative imageUrl={slide.imageUrl} imageAlt={slide.imageAlt} brand={slide.brand} onSeeContact={showContact} />
              ) : Creative ? (
                <Creative onSeeContact={showContact} />
              ) : null}
            </div>
          </div>

          <div role="tablist" aria-label="Choose a sponsored brand" className="mt-5 grid grid-cols-3 gap-3 sm:gap-6">
            {slides.map((item, index) => {
              const active = index === activeIndex;
              const fill = active ? (reduced ? 1 : progress) : index < activeIndex ? 1 : 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="featured-slide"
                  onClick={() => goTo(index)}
                  className="group text-left"
                >
                  <span aria-hidden="true" className="block h-0.5 overflow-hidden bg-line">
                    <span
                      className={cn('block h-full origin-left transition-transform duration-100 ease-linear', active ? 'bg-gold' : 'bg-line-strong')}
                      style={{ transform: `scaleX(${fill})` }}
                    />
                  </span>
                  <span
                    className={cn(
                      'mt-3 block truncate text-xs font-bold transition-colors sm:text-[15px]',
                      active ? 'text-fg' : 'text-fg-muted group-hover:text-fg',
                    )}
                  >
                    {item.brand}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {spotOfTheWeek && (
            <article className="border border-line bg-ink-800 p-6 sm:p-7">
              <Kicker>Spot of the week</Kicker>
              <div className="mt-5 flex items-center gap-4">
                <Avatar initials={spotOfTheWeek.initial} tone="gold" size="md" className="text-xl" />
                <div>
                  <h3 className="text-lg font-extrabold tracking-[-0.01em] text-fg sm:text-xl">{spotOfTheWeek.name}</h3>
                  <p className="text-sm text-fg-muted">{spotOfTheWeek.meta}</p>
                </div>
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-fg-muted">{spotOfTheWeek.blurb}</p>
              <p className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-fg-muted">
                <span>
                  <strong className="font-bold text-fg">{formatNumber(spotOfTheWeek.views)}</strong> profile views
                </span>
                <span>
                  <strong className="font-bold text-fg">{spotOfTheWeek.enquiries}</strong> enquiries
                </span>
              </p>
            </article>
          )}

          <article className="flex-1 border border-line bg-ink-800 p-6 sm:p-7">
            <Kicker>Why brands choose us</Kicker>
            <SegmentedControl
              className="mt-5"
              label="Compare promotion types"
              options={COMPARE_OPTIONS}
              value={compare}
              onChange={setCompare}
              stretch
              mode="tabs"
              idPrefix="compare"
              itemClassName="max-sm:min-w-0 max-sm:!h-auto max-sm:min-h-[40px] max-sm:!whitespace-normal max-sm:!px-2 max-sm:py-2 max-sm:!text-[10px] max-sm:!tracking-[0.06em] max-sm:text-center max-sm:leading-tight"
            />
            <ul id="compare-panel" role="tabpanel" aria-labelledby={`compare-tab-${compare}`} className="mt-5 space-y-3.5">
              {(comparison?.[compare] ?? []).map((item) => (
                <li key={item} className="flex animate-rise-in items-start gap-3 text-[15px] text-fg">
                  {/* Red cross for what a typical promotion lacks; green is only for open / positive. */}
                  {compare === 'typical' ? (
                    <X className="mt-[3px] h-4 w-4 shrink-0 text-coral" strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    <Check className="mt-[3px] h-4 w-4 shrink-0 text-mint-ink" strokeWidth={2.5} aria-hidden="true" />
                  )}
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </>
  );
}

export function Featured() {
  // GET /featured → { slides, spotOfTheWeek, comparison }
  const featuredQuery = useApiQuery('featured');
  return (
    <Section id="spots" tone={850} aria-labelledby="spots-title">
      <SectionHeader
        eyebrow="Featured"
        title="Spot on this week."
        accent="this week."
        titleId="spots-title"
        description="The hero banner rotates between paying brands. Each one is labelled as sponsored and has its own report."
      />
      <QueryState
        query={featuredQuery}
        errorTitle="Couldn’t load this week’s featured brands."
        skeleton={
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
            <Skeleton className="aspect-[1662/889] rounded-sm" />
            <Skeleton className="min-h-[420px] rounded-sm" />
          </div>
        }
      >
        {(data) =>
          data.slides?.length ? (
            <FeaturedContent slides={data.slides} spotOfTheWeek={data.spotOfTheWeek} comparison={data.comparison} />
          ) : null
        }
      </QueryState>
    </Section>
  );
}
