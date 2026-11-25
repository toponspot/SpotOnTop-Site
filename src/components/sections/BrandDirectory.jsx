import { useDeferredValue, useMemo, useState } from 'react';
import { Check, Mail, Minus, Phone, Plus, Search, X } from 'lucide-react';
import { DIRECTORY_MARKETS, DIRECTORY_SORTS } from '../../config/filters';
import { useApiQuery } from '../../hooks/useApiQuery';
import { callApi } from '../../services/api';
import { clickRate } from '../../utils/brands';
import { cn } from '../../utils/cn';
import { formatNumber, formatPercent } from '../../utils/currency';
import { formatRelativeDate } from '../../utils/date';
import { ErrorState, Skeleton } from '../ui/AsyncState';
import { Avatar } from '../ui/Avatar';
import { CopyButton } from '../ui/CopyButton';
import { inputClasses, inputSurfaces } from '../ui/Field';
import { Section } from '../ui/Section';
import { SectionHeader } from '../ui/SectionHeader';
import { SegmentedControl } from '../ui/SegmentedControl';

const SORTERS = {
  featured: (a, b) => a.featuredRank - b.featuredRank,
  views: (a, b) => b.views - a.views,
  rate: (a, b) => clickRate(b) - clickRate(a),
};

/** Rate bar is relative to a 10% click rate, the top of the realistic range. */
const RATE_CEILING = 0.1;

function BrandCard({ brand }) {
  const [open, setOpen] = useState(false);
  const rate = clickRate(brand);
  const panelId = `contact-${brand.id}`;

  return (
    <article className="flex flex-col rounded-sm border border-line bg-ink-800 p-6 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <Avatar initials={brand.initials} tone={brand.tone} />
        <span className="inline-flex shrink-0 items-center gap-1 pt-1 text-[11px] font-medium text-mint-ink">
          <Check className="h-3 w-3" aria-hidden="true" />
          Verified demo
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-extrabold text-fg">{brand.name}</h3>
      <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-fg-muted">{brand.pitch}</p>

      <dl className="mt-5 grid grid-cols-3 gap-2">
        {[
          ['Views', formatNumber(brand.views)],
          ['Clicks', formatNumber(brand.clicks)],
          ['Rate', formatPercent(rate)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-fg-subtle">{label}</dt>
            <dd className="mt-1 text-lg font-extrabold tabular text-fg">{value}</dd>
          </div>
        ))}
      </dl>
      <span className="mt-3 block h-[5px] overflow-hidden rounded-full bg-ink-950" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-[#F2B100] to-[#FFD24D]"
          style={{ width: `${Math.min(100, (rate / RATE_CEILING) * 100)}%` }}
        />
      </span>

      <div className="mt-5 border-t border-line pt-1">
        <button
          type="button"
          onClick={() => {
            if (!open) callApi('recordContactView', { brandId: brand.id }).catch(() => { }); // POST /brands/:brandId/contact-views
            setOpen((value) => !value);
          }}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between rounded-md py-3 text-[15px] font-semibold text-fg transition-colors hover:text-accent"
        >
          {open ? 'Hide contact' : 'Show contact'}
          {open ? <Minus className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
        </button>
        <div
          id={panelId}
          className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
        >
          <div className={cn('overflow-hidden transition-[visibility] duration-300', open ? 'visible' : 'invisible')}>
            <div className="space-y-2.5 bg-ink-900 p-4 text-sm">
              <p className="font-semibold text-fg">
                {brand.contact.name}
                <span className="font-normal text-fg-muted">, {brand.contact.role}</span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <a href={`mailto:${brand.contact.email}`} className="flex min-w-0 items-center gap-2 text-fg-muted hover:text-fg">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{brand.contact.email}</span>
                </a>
                <CopyButton text={brand.contact.email} label="Copy" className="h-7 px-2" />
              </p>
              <a href={`tel:${brand.contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-fg-muted hover:text-fg">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                {brand.contact.phone}
              </a>
              <p className="pt-1 text-xs text-fg-subtle">
                {brand.city}
                {brand.updatedAt && ` · Contact updated ${formatRelativeDate(brand.updatedAt)}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function BrandDirectory() {
  const [market, setMarket] = useState('all');
  const [sort, setSort] = useState('featured');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // GET /brands. Filtering and sorting happen in the browser for instant feedback.
  const brandsQuery = useApiQuery('brands');
  const allBrands = brandsQuery.data;

  const brands = useMemo(() => {
    if (!allBrands) return [];
    const term = deferredQuery.trim().toLowerCase();
    return allBrands.filter((brand) => market === 'all' || brand.market === market)
      .filter(
        (brand) =>
          !term ||
          [brand.name, brand.pitch, brand.city].some((field) => String(field ?? '').toLowerCase().includes(term)),
      )
      .sort(SORTERS[sort]);
  }, [allBrands, market, sort, deferredQuery]);

  const reset = () => {
    setQuery('');
    setMarket('all');
  };

  return (
    <Section id="brands" tone={900} aria-labelledby="brands-title">
      <SectionHeader
        eyebrow="Directory"
        title="Brands on the bridge"
        accent="bridge"
        titleId="brands-title"
        description="USA brands that want to sell in India, and Indian brands that want a premium audience. Brands can change their contacts at any time."
      />

      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 overflow-x-auto px-1 scrollbar-none">
          <SegmentedControl label="Filter by market" options={DIRECTORY_MARKETS} value={market} onChange={setMarket} tone="light" size="sm" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
            <label htmlFor="brand-search" className="sr-only">
              Search brands
            </label>
            <input
              id="brand-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search brands or cities"
              className={cn(inputClasses, inputSurfaces.transparent, 'h-10 pl-10 pr-9 text-[13px]')}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-fg-subtle hover:text-fg"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="-mx-1 overflow-x-auto px-1 scrollbar-none">
            <SegmentedControl label="Sort brands" options={DIRECTORY_SORTS} value={sort} onChange={setSort} tone="light" size="sm" />
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {brands.length} {brands.length === 1 ? 'brand' : 'brands'} shown.
      </p>

      {!allBrands ? (
        brandsQuery.error ? (
          <ErrorState error={brandsQuery.error} onRetry={brandsQuery.refetch} title="Couldn’t load the brand directory." />
        ) : (
          <div role="status" aria-label="Loading brands" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-80 rounded-sm" />
            ))}
          </div>
        )
      ) : brands.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      ) : (
        <div className="rounded-sm border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="text-lg font-bold text-fg">No brands match “{deferredQuery}”.</p>
          <p className="mt-2 text-sm text-fg-muted">Try a brand name, a city like Mumbai, or a product like denim.</p>
          <button type="button" onClick={reset} className="mt-5 text-sm font-bold text-accent underline-offset-4 hover:underline">
            Clear search and filters
          </button>
        </div>
      )}
    </Section>
  );
}
