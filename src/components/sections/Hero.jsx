import { useState } from 'react';
import { ArrowRight, Check, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBillboard from '../../assets/images/hero-billboard.webp';
import { useQuote } from '../../context/QuoteContext';
import { API_CONFIG } from '../../config/api.config';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useEasedNumber } from '../../hooks/useEasedNumber';
import { formatAgo, useRelativeNow } from '../../hooks/useRelativeNow';
import { cn } from '../../utils/cn';
import { formatNumber, formatPercent } from '../../utils/currency';
import { pathForSection } from '../../utils/scroll';
import { Skeleton } from '../ui/AsyncState';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { DemoBadge } from '../ui/DemoBadge';
import { Globe } from '../ui/Globe';
import { Landmark } from '../ui/Landmarks';
import { VerificationSeal } from '../ui/VerificationSeal';
import { KaveriSilkCreative } from './featured/Creatives';

const MODES = [
  { value: 'usa', label: 'USA brands entering India', landmark: 'usa' },
  { value: 'india', label: 'Indian brands', landmark: 'india' },
];

/**
 * Sponsored image in the hero card. A real API can return { imageUrl, imageAlt };
 * the demo uses built-in creatives by `kind`.
 */
function HeroPreview({ preview }) {
  if (!preview) return <Skeleton className="h-full w-full rounded-none" />;
  if (preview.imageUrl || preview.kind === 'billboard') {
    return (
      <img
        key={preview.imageUrl ?? 'billboard'}
        src={preview.imageUrl ?? heroBillboard}
        alt={preview.imageAlt ?? 'Sponsored preview'}
        loading="eager"
        className="h-full w-full animate-fade-in object-cover object-[50%_46%]"
      />
    );
  }
  return (
    <div key={preview.kind} className="h-full w-full animate-fade-in">
      <KaveriSilkCreative compact />
    </div>
  );
}

function StatTile({ value, label, format = formatNumber }) {
  const eased = useEasedNumber(value);
  return (
    <div className="bg-ink-900 px-3 py-3 sm:px-4 sm:py-3.5">
      <p className="text-xl font-extrabold leading-none tabular text-fg sm:text-[28px]">
        {value === undefined ? <Skeleton className="h-[1em] w-16" /> : format(eased)}
      </p>
      <p className="caps mt-2 text-[10px] font-bold text-fg-subtle sm:text-[11px]">{label}</p>
    </div>
  );
}

export function Hero() {
  const { openQuoteBuilder } = useQuote();
  const [mode, setMode] = useState('usa');
  const now = useRelativeNow(1000);
  // GET /stats/hero?market=… — polled so the counter stays live.
  const heroQuery = useApiQuery('heroStats', { market: mode }, { pollInterval: API_CONFIG.polling.heroStats });
  const stats = heroQuery.data;
  const feed = stats?.feed ?? [];
  const peopleNow = useEasedNumber(stats?.peopleNow);
  // The globe and the India / USA split read the same traffic snapshot as the Live traffic section.
  const trafficQuery = useApiQuery('trafficSnapshot', { market: 'all' }, { pollInterval: API_CONFIG.polling.trafficSnapshot });
  const traffic = trafficQuery.data;
  const shareOf = (name) => traffic?.countries?.find((country) => country.name === name)?.pct;
  // Busiest city of a market, used for the arc caption above the globe (e.g. "New York → Mumbai").
  const topCity = (market) =>
    (traffic?.cities ?? []).filter((city) => city.market === market).sort((a, b) => b.share - a.share)[0];
  const arcFrom = topCity(mode === 'usa' ? 'usa' : 'india');
  const arcTo = topCity(mode === 'usa' ? 'india' : 'usa');

  return (
    <section id="top" className="relative overflow-hidden bg-ink-950 pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-40">
      <Container className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,600px)] xl:gap-14 2xl:grid-cols-[minmax(0,720px)_minmax(0,820px)] 2xl:justify-between">
        <div className="max-w-[720px]">
          <p className="caps flex items-center gap-2.5 text-[11px] font-extrabold text-accent sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            Interactive advertising marketplace
          </p>
          <h1 className="mt-5 text-[56px] font-extrabold leading-none tracking-[-0.035em] text-fg sm:text-[84px] lg:text-[96px] 2xl:text-[115px]">
            Be Seen <span className="block text-accent">On Top</span>
          </h1>
          <p className="mt-6 max-w-[40rem] text-lg leading-[1.55] text-fg-muted sm:text-xl 2xl:text-[22px]">
            A premium billboard for brands that want the attention of founders, CEOs and serious buyers in India and the USA. Every banner shows its own live views and clicks.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => openQuoteBuilder()}>
              Get a Banner Quote
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button as={Link} to={pathForSection('live-traffic')} size="lg" variant="outline">
              Watch Live Traffic
              <Play className="h-3 w-3 fill-current" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-10 flex flex-col gap-2 border border-line bg-ink-900 p-2 sm:p-2.5 2xl:flex-row 2xl:items-center">
            <p id="hero-show-me" className="caps px-3 pt-1 text-[10px] font-extrabold text-fg-subtle 2xl:pt-0 2xl:text-[11px]">
              Show me
            </p>
            <div role="radiogroup" aria-labelledby="hero-show-me" className="grid flex-1 gap-2 sm:grid-cols-2">
              {MODES.map((option) => {
                const selected = mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setMode(option.value)}
                    className={cn(
                      'flex h-12 items-center justify-center gap-2.5 whitespace-nowrap border bg-ink-800 px-3 text-[13px] font-semibold transition-colors 2xl:px-4 2xl:text-sm',
                      selected ? 'border-gold text-fg' : 'border-transparent text-fg-muted hover:border-line-strong hover:text-fg',
                    )}
                  >
                    <Landmark country={option.landmark} className={cn('h-6 w-6', selected ? 'text-accent' : 'text-fg-subtle')} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-fg-muted 2xl:text-[15px]">
            {['Verified Demo Brands', 'Two Markets, One Audience', '24 Hours to Change any Contact'].map((line) => (
              <li key={line} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" strokeWidth={2} aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative border border-line bg-ink-800">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-6 sm:py-4">
            <p className="truncate text-sm tracking-wide text-fg-muted sm:text-[15px]">spotontop.example / live</p>
            <Badge tone="live" dot pulse>
              LIVE NOW
            </Badge>
          </div>

          <div
            aria-busy={heroQuery.isPreviousData || undefined}
            className={cn('p-4 transition-opacity duration-200 sm:p-6', heroQuery.isPreviousData && 'opacity-60')}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[64px] font-extrabold leading-[0.9] tracking-[-0.04em] text-fg tabular sm:text-[88px]" aria-live="off">
                  {stats ? Math.round(peopleNow) : <Skeleton className="inline-block h-[0.8em] w-[1.6em] align-baseline" />}
                </p>
                <p className="mt-2 text-sm text-fg-muted sm:text-base">people on Spot On Top right now</p>
                <DemoBadge data={stats} className="mt-3" />
                {(shareOf('India') !== undefined || shareOf('USA') !== undefined) && (
                  <dl className="mt-4 space-y-1 text-sm font-extrabold tabular">
                    {shareOf('India') !== undefined && (
                      <div className="flex items-baseline gap-1.5">
                        <dt className="sr-only">India share</dt>
                        <dd className="text-accent">{shareOf('India')}%</dd>
                        <span className="caps text-[10px] font-bold text-fg-subtle">India</span>
                      </div>
                    )}
                    {shareOf('USA') !== undefined && (
                      <div className="flex items-baseline gap-1.5">
                        <dt className="sr-only">USA share</dt>
                        <dd className="text-iris-ink">{shareOf('USA')}%</dd>
                        <span className="caps text-[10px] font-bold text-fg-subtle">USA</span>
                      </div>
                    )}
                  </dl>
                )}
              </div>
              <div className="w-[150px] shrink-0 sm:w-[250px]">
                <div className="mb-2 text-right">
                  <p className="caps truncate text-[10px] font-extrabold text-accent">GLOBE ANIMATION GOES HERE</p>
                </div>
                <Globe
                  cities={traffic?.cities}
                  direction={mode === 'usa' ? 'usa-to-india' : 'india-to-usa'}
                  showLabels
                  label={mode === 'usa' ? 'Traffic flowing from the USA to India' : 'Traffic flowing from India to the USA'}
                />
              </div>
            </div>

            <div className="relative mt-5 aspect-[2.3/1] overflow-hidden bg-ink-900 sm:aspect-[2.58/1]">
              <HeroPreview preview={stats?.preview} />
              <span className="caps absolute right-3 top-3 bg-black/65 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur sm:right-4 sm:top-4 sm:text-[11px]">
                Sponsored preview
              </span>
              <VerificationSeal className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              <StatTile value={stats?.visitsToday} label="visits today" format={(value) => formatNumber(Math.round(value))} />
              <StatTile value={stats?.contactClicks} label="contact clicks" format={(value) => formatNumber(Math.round(value))} />
              <StatTile value={stats?.clickRate} label="click rate" format={formatPercent} />
            </div>

            <ul className="mt-3 space-y-2" aria-label="Latest activity">
              {!stats &&
                [0, 1].map((index) => (
                  <li key={index} className="bg-ink-900 px-4 py-3">
                    <Skeleton className="h-5 w-2/3" />
                  </li>
                ))}
              {feed.map((event, index) => (
                <li
                  key={event.id}
                  className={cn('flex items-center gap-3 bg-ink-900 px-4 py-3', index === 0 && 'animate-rise-in')}
                >
                  <span
                    className={cn(
                      'caps w-11 shrink-0 text-[10px] font-extrabold',
                      event.market === 'usa' ? 'text-iris-ink' : 'text-accent',
                    )}
                  >
                    {event.market === 'usa' ? 'USA' : 'INDIA'}
                  </span>
                  <span className="flex-1 truncate text-sm font-semibold text-fg sm:text-[15px]">{event.label}</span>
                  <span className={cn('text-xs font-medium tabular', index === 0 ? 'text-accent' : 'text-fg-subtle')}>
                    {formatAgo(event.at, now)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}