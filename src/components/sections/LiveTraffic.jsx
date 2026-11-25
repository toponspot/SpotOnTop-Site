import { useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { API_CONFIG } from '../../config/api.config';
import { TRAFFIC_MARKETS } from '../../config/filters';
import { useInView } from '../../hooks/useInView';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useCountUp } from '../../hooks/useCountUp';
import { formatAgo } from '../../hooks/useRelativeNow';
import { cn } from '../../utils/cn';
import { formatNumber } from '../../utils/currency';
import { ErrorState, Skeleton } from '../ui/AsyncState';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DemoBadge } from '../ui/DemoBadge';
import { Globe } from '../ui/Globe';
import { Landmark } from '../ui/Landmarks';
import { LiveDot } from '../ui/LiveDot';
import { Section } from '../ui/Section';
import { Kicker, SectionHeader } from '../ui/SectionHeader';
import { SegmentedControl } from '../ui/SegmentedControl';

const PANEL_TABS = [
  { value: 'where', label: 'Where visitors are' },
  { value: 'feed', label: 'Live feed' },
  { value: 'week', label: 'Last 7 days' },
];

// India is yellow, the USA is blue, everything else is grey.
const MARKET_BAR = { india: 'bg-gold-bar', usa: 'bg-iris', other: 'bg-fg-subtle/70' };

function StatCard({ label, value, tone = 'default', live = false, demo, start }) {
  // Counts up the first time the section scrolls into view, then eases to each new live value.
  const counted = useCountUp(value ?? 0, { start: start && value !== undefined, duration: 1100 });
  return (
    <div className="border border-line bg-ink-800 px-5 py-4 sm:px-6 sm:py-5">
      <p className="caps flex items-center gap-2 text-[10px] font-bold text-fg-muted sm:text-[11px]">
        {live && <LiveDot />}
        {label}
      </p>
      <p
        className={cn(
          'mt-2 text-3xl font-extrabold tracking-[-0.02em] tabular sm:text-[40px] sm:leading-[1.1]',
          tone === 'gold' && 'text-accent',
          tone === 'mint' && 'text-mint-ink',
          tone === 'default' && 'text-fg',
        )}
      >
        {value === undefined ? <Skeleton className="h-[1em] w-24" /> : formatNumber(Math.round(counted))}
      </p>
      <DemoBadge data={demo} className="mt-3" />
    </div>
  );
}

/** Line + area chart of the last 24 hourly samples. Hover, tap or use arrow keys to inspect. */
function VisitorsChart({ history, demo }) {
  const chartRef = useRef(null);
  const [drawRef, drawn] = useInView({ threshold: 0.35 });
  const [inspected, setInspected] = useState(null);
  const latestIndex = history.length - 1;
  const shownIndex = inspected ?? latestIndex;
  const hoursAgo = latestIndex - shownIndex;

  // Fit the line to the data: the lowest sample sits near the floor, the highest near the top.
  const min = Math.min(...history);
  const range = Math.max(...history) - min || 1;
  const xOf = (index) => (index / latestIndex) * 100;
  const yOf = (value) => 12 + (1 - (value - min) / range) * 78;
  const points = history.map((value, index) => `${xOf(index).toFixed(2)},${yOf(value).toFixed(2)}`);
  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L100,100 L0,100 Z`;

  const inspectAt = (clientX) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return;
    const ratio = (clientX - rect.left) / rect.width;
    setInspected(Math.min(latestIndex, Math.max(0, Math.round(ratio * latestIndex))));
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setInspected(Math.max(0, shownIndex - 1));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setInspected(Math.min(latestIndex, shownIndex + 1));
    } else if (event.key === 'Escape') {
      setInspected(null);
    }
  };

  const shownX = xOf(shownIndex);
  const shownY = yOf(history[shownIndex]);

  return (
    <div ref={drawRef} className="flex h-full flex-col border border-line bg-ink-800 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-fg-muted">Visitors, last 24 hours</p>
          <DemoBadge data={demo} />
        </div>
        <p className="text-[11px] text-fg-subtle sm:text-xs">Hover the chart to inspect any hour</p>
      </div>
      <p className="sr-only" aria-live="polite">
        {history[shownIndex]} visitors {hoursAgo === 0 ? 'right now' : `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`}
      </p>

      <div
        ref={chartRef}
        tabIndex={0}
        role="img"
        aria-label={`Visitors per hour over the last 24 hours. Ranges from ${min} to ${Math.max(...history)}. Use left and right arrow keys to inspect.`}
        onKeyDown={onKeyDown}
        onPointerMove={(event) => inspectAt(event.clientX)}
        onPointerDown={(event) => inspectAt(event.clientX)}
        onPointerLeave={() => setInspected(null)}
        onBlur={() => setInspected(null)}
        className="relative mt-7 min-h-[13rem] flex-1 cursor-crosshair sm:min-h-[15rem]"
      >

        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={cn(
            'pointer-events-none absolute inset-0 h-full w-full overflow-visible transition-[clip-path] duration-[1100ms] ease-out',
            drawn ? '[clip-path:inset(-4px_-4px_-4px_0)]' : '[clip-path:inset(-4px_100%_-4px_0)]',
          )}
        >
          <defs>
            <linearGradient id="visitors-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFC72C" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFC72C" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#visitors-fill)" />
          <path
            d={linePath}
            fill="none"
            className="stroke-gold"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Vertical guide + readout while inspecting an hour. */}
        {inspected !== null && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-px bg-line-strong"
              style={{ left: `${shownX}%` }}
            />
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute -top-1 -translate-y-full whitespace-nowrap border border-line-strong bg-ink-900 px-2.5 py-1 text-xs font-semibold text-fg',
                shownX < 15 ? 'translate-x-0' : shownX > 85 ? '-translate-x-full' : '-translate-x-1/2',
              )}
              style={{ left: `${shownX}%` }}
            >
              {history[shownIndex]} visitors · {hoursAgo === 0 ? 'now' : `${hoursAgo}h ago`}
            </span>
          </>
        )}

        {/* The point being shown: the newest sample by default, with a soft gold halo. */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold transition-[opacity] duration-700',
            drawn ? 'opacity-100 delay-[900ms]' : 'opacity-0',
          )}
          style={{ left: `${shownX}%`, top: `${shownY}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs text-fg-muted" aria-hidden="true">
        <span>24 h ago</span>
        <span>now</span>
      </div>
    </div>
  );
}

/** `cities` arrive already filtered for the market, with shares in percent. */
function CityBreakdown({ cities, otherShare = 0, market, countries = [] }) {
  // "Other" closes the list, so every row of the split is shown. Same numbers as before.
  const rows = otherShare > 0 ? [...cities, { name: 'Other', market: 'other', share: otherShare }] : cities;
  const countryPct = (name) => countries.find((country) => country.name === name)?.pct;

  return (
    <div>
      <ul className="space-y-3.5">
        {rows.map((city) => (
          <li key={city.name} className="grid grid-cols-[96px_minmax(0,1fr)_40px] items-center gap-3 text-[13px] sm:grid-cols-[110px_minmax(0,1fr)_44px]">
            <span className="truncate font-bold text-fg">{city.name}</span>
            <span className="h-1.5 overflow-hidden bg-line" aria-hidden="true">
              <span
                className={cn('block h-full transition-[width] duration-700', MARKET_BAR[city.market])}
                style={{ width: `${Math.min(100, city.share * (market === 'all' ? 3.2 : 1.6))}%` }}
              />
            </span>
            <span className="text-right font-extrabold text-fg tabular">{city.share}%</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-fg-muted">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-gold" aria-hidden="true" />India{countryPct('India') !== undefined && ` ${countryPct('India')}%`}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-iris" aria-hidden="true" />USA{countryPct('USA') !== undefined && ` ${countryPct('USA')}%`}</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 bg-fg-subtle" aria-hidden="true" />
          Other{otherShare > 0 && ` ${otherShare}%`}
        </span>
      </div>
    </div>
  );
}

/** `feed` arrives already filtered for the market, newest first. */
function LiveFeed({ feed, now }) {
  const visible = feed;
  if (visible.length === 0) {
    return <p className="py-8 text-center text-sm text-fg-muted">Waiting for the next visit from this market.</p>;
  }
  return (
    <ul className="max-h-[300px] space-y-2 overflow-y-auto pr-1" aria-label="Live visitor activity">
      {visible.slice(0, 8).map((event, index) => (
        <li key={event.id} className={cn('flex items-center gap-3 bg-ink-900 px-3.5 py-2.5', index === 0 && 'animate-rise-in')}>
          <span className={cn('w-11 shrink-0 text-[10px] font-extrabold tracking-wide', event.market === 'usa' ? 'text-iris-ink' : 'text-accent')}>
            {event.market === 'usa' ? 'USA' : 'INDIA'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-fg">{event.label}</span>
            <span className="block truncate text-xs text-fg-subtle">
              {event.brand}, from {event.city}
            </span>
          </span>
          <span className={cn('text-xs tabular', index === 0 ? 'text-accent' : 'text-fg-subtle')}>{formatAgo(event.at, now)}</span>
        </li>
      ))}
    </ul>
  );
}

/** `weekly` is [{ day, india, usa }] for the selected market (others zeroed). */
function WeeklyChart({ weekly }) {
  const rows = weekly;
  const max = Math.max(...rows.map((day) => day.india + day.usa));
  const total = rows.reduce((sum, day) => sum + day.india + day.usa, 0);

  return (
    <div>
      <p className="text-sm text-fg-muted">
        <span className="text-2xl font-extrabold text-fg tabular">{formatNumber(total)}</span> visits this week
      </p>
      <div className="mt-4 flex h-48 items-end gap-2 sm:gap-3" role="img" aria-label={`Daily visits for the last seven days, ${formatNumber(total)} in total.`}>
        {rows.map((day) => {
          const sum = day.india + day.usa;
          return (
            <div key={day.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${day.day}: ${formatNumber(sum)} visits`}>
              <div className="flex w-full flex-col justify-end overflow-hidden" style={{ height: `${(sum / max) * 100}%` }}>
                <span className="block w-full bg-iris" style={{ height: `${(day.usa / sum) * 100}%` }} />
                <span className="block w-full bg-gold" style={{ height: `${(day.india / sum) * 100}%` }} />
              </div>
              <span className="text-[11px] font-semibold text-fg-subtle">{day.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Globe card: the India ⇄ USA split, drawn from the same snapshot as the cities beside it. */
function GlobeCard({ snapshot, market }) {
  const share = (name) => snapshot?.countries?.find((country) => country.name === name)?.pct;
  const india = share('India');
  const usa = share('USA');
  return (
    <div className="flex h-full flex-col border border-line bg-ink-800 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Kicker className="text-fg-muted">India ⇄ USA · Live</Kicker>
        <DemoBadge data={snapshot} />
      </div>
      <div className="flex flex-1 items-center justify-center py-4">
        {snapshot ? (
          <Globe
            cities={snapshot.cities}
            showLabels
            direction="usa-to-india"
            label={`Globe of live visits between the USA and India, ${market === 'all' ? 'all markets' : market === 'india' ? 'India only' : 'USA only'}`}
            className="w-full max-w-[420px]"
          />
        ) : (
          <Skeleton className="aspect-square w-full max-w-[420px] rounded-full" />
        )}
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2.5">
          <Landmark country="india" className="h-7 w-7 text-fg-subtle" />
          {india !== undefined && (
            <span className="text-xl font-extrabold text-accent tabular">
              {india}% <span className="caps text-[10px] font-bold text-fg-subtle">India</span>
            </span>
          )}
        </p>
        <p className="flex items-center gap-2.5">
          {usa !== undefined && (
            <span className="text-xl font-extrabold text-iris-ink tabular">
              {usa}% <span className="caps text-[10px] font-bold text-fg-subtle">USA</span>
            </span>
          )}
          <Landmark country="usa" className="h-7 w-7 text-fg-subtle" />
        </p>
      </div>
    </div>
  );
}

export function LiveTraffic() {
  const { showToast } = useUI();
  const [sectionRef, inView] = useInView({ threshold: 0.05, once: false });
  const [market, setMarket] = useState('all');
  // GET /stats/traffic?market=… — polled while the section is on screen.
  const traffic = useApiQuery(
    'trafficSnapshot',
    { market },
    { pollInterval: inView ? API_CONFIG.polling.trafficSnapshot : null },
  );
  const snapshot = traffic.data;
  const totals = snapshot?.totals ?? {};
  const [tab, setTab] = useState('where');
  const [spinning, setSpinning] = useState(false);

  const onRefresh = () => {
    traffic.refetch({ refresh: true }).catch(() => { });
    setSpinning(true);
    window.setTimeout(() => setSpinning(false), 700);
    showToast('Live numbers refreshed.', { tone: 'info', duration: 2400 });
  };

  return (
    <Section id="live-traffic" tone={900} aria-labelledby="traffic-title">
      <div ref={sectionRef}>
        <SectionHeader
          eyebrow="Proof"
          badge={
            <Badge tone="live" dot pulse size="sm" className="uppercase tracking-wide">
              Updating every {Math.round(API_CONFIG.polling.trafficSnapshot / 1000)} seconds
            </Badge>
          }
          title="Live traffic, in the open"
          accent="in the open"
          titleId="traffic-title"
          description="We show our numbers so brands can judge us. This demo simulates them. In the live product they come from verified human visits only."
        />

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-fg-muted">Show</span>
            <SegmentedControl label="Market" options={TRAFFIC_MARKETS} value={market} onChange={setMarket} size="sm" />
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RotateCw className={cn('h-4 w-4', spinning && 'animate-spin')} aria-hidden="true" />
            Refresh live updates
          </Button>
        </div>

        <div
          aria-busy={traffic.isPreviousData || undefined}
          className={cn('grid grid-cols-2 gap-3 transition-opacity duration-200 sm:gap-4 lg:grid-cols-5', traffic.isPreviousData && 'opacity-50')}
        >
          <div className="col-span-2 lg:col-span-1">
            <StatCard label="Visitors right now" value={totals.visitorsNow} tone="gold" live demo={snapshot} start={inView} />
          </div>
          <StatCard label="Visits today" value={totals.visitsToday} demo={snapshot} start={inView} />
          <StatCard label="Banner views today" value={totals.bannerViews} demo={snapshot} start={inView} />
          <StatCard label="Contact clicks today" value={totals.contactClicks} demo={snapshot} start={inView} />
          <StatCard label="Enquiries today" value={totals.enquiries} tone="mint" demo={snapshot} start={inView} />
        </div>

        {/* Row 2: globe card + cities panel. Row 3: the 24-hour chart at full width. */}
        <div
          aria-busy={traffic.isPreviousData || undefined}
          className={cn('mt-4 grid gap-4 transition-opacity duration-200 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]', traffic.isPreviousData && 'opacity-50')}
        >
          <GlobeCard snapshot={snapshot} market={market} />
          <div className="border border-line bg-ink-800 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl
                label="Traffic detail"
                options={PANEL_TABS}
                value={tab}
                onChange={setTab}
                mode="tabs"
                idPrefix="traffic"
                size="sm"
                className="flex-wrap"
              />
              <DemoBadge data={snapshot} className="ml-auto" />
            </div>
            <div id="traffic-panel" role="tabpanel" aria-labelledby={`traffic-tab-${tab}`} className="mt-6">
              {!snapshot && <Skeleton className="h-56 w-full" />}
              {snapshot && tab === 'where' && (
                <CityBreakdown cities={snapshot.cities} otherShare={snapshot.otherShare} market={market} countries={snapshot.countries} />
              )}
              {snapshot && tab === 'feed' && <LiveFeed feed={snapshot.feed} now={Date.now()} />}
              {snapshot && tab === 'week' && <WeeklyChart weekly={snapshot.weekly} />}
            </div>
          </div>
        </div>

        <div
          aria-busy={traffic.isPreviousData || undefined}
          className={cn('mt-4 transition-opacity duration-200', traffic.isPreviousData && 'opacity-50')}
        >
          {snapshot ? (
            <VisitorsChart history={snapshot.history} demo={snapshot} />
          ) : traffic.error ? (
            <ErrorState error={traffic.error} onRetry={traffic.refetch} title="Couldn’t load live traffic." />
          ) : (
            <Skeleton className="min-h-[20rem]" />
          )}
        </div>
      </div>
    </Section>
  );
}
