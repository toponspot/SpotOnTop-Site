import { ArrowRight, Check } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';
import { useSettings } from '../../context/SettingsContext';
import { useUI } from '../../context/UIContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { cn } from '../../utils/cn';
import { QueryState, Skeleton } from '../ui/AsyncState';
import { Button } from '../ui/Button';
import { FoundingBadge } from '../ui/FoundingBadge';
import { Section } from '../ui/Section';
import { SectionHeader } from '../ui/SectionHeader';

export function Pricing() {
  const { formatPrice } = useSettings();
  const { openQuoteBuilder } = useQuote();
  const { showToast } = useUI();
  // GET /pricing
  const pricingQuery = useApiQuery('pricing');

  const customise = (product) => {
    openQuoteBuilder(product.quotePreset ?? {});
    showToast(`${product.name} added to your quote. Shape it below.`, { tone: 'info' });
  };

  return (
    <Section id="pricing" tone={800} aria-labelledby="pricing-title">
      <SectionHeader
        eyebrow="Pricing"
        title="Simple prices, shown in your currency"
        accent="shown in your currency"
        titleId="pricing-title"
        description="Pick a product, then shape it in the quote builder below. Prices are before GST and switch with the currency control in the header."
      />

      <QueryState
        query={pricingQuery}
        errorTitle="Couldn’t load pricing."
        skeleton={
          <div className="grid gap-5 md:grid-cols-3 2xl:gap-8">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-[420px] rounded-sm" />
            ))}
          </div>
        }
      >
        {(products) => (
      <div className="grid gap-5 md:grid-cols-3 2xl:gap-8">
        {products.map((product, index) => (
          <article
            key={product.id}
            className={cn(
              'flex flex-col rounded-sm border p-6 sm:p-8 md:p-5 lg:p-8',
              product.highlight ? 'border-gold bg-ink-800' : 'border-line bg-ink-800',
            )}
          >
            <div className="flex min-h-[28px] items-center justify-between gap-3">
              <span className="text-[13px] font-bold text-accent">{String(index + 1).padStart(2, '0')}</span>
              {product.tag && (
                <span className="rounded-md bg-gold px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.06em] text-navy">
                  {product.tag}
                </span>
              )}
            </div>
            <h3 className="mt-5 text-2xl font-extrabold tracking-[-0.02em] text-fg md:text-xl lg:text-2xl">{product.name}</h3>
            <p className="mt-4 flex flex-wrap items-baseline gap-1.5">
              <span className="font-sans text-[34px] font-extrabold tabular-nums tracking-tight text-fg sm:text-[40px] md:text-[28px] lg:text-[34px] xl:text-[40px]">
                {formatPrice(product.price)}
              </span>
              {product.per && <span className="text-sm text-fg-muted">{product.per}</span>}
            </p>
            {product.founding && <FoundingBadge className="mt-3" />}
            {product.founding && product.places && (
              <p className="mt-2 text-[13px] font-semibold text-accent">
                {product.places.total} places, {Math.max(0, product.places.total - product.places.taken)} left
              </p>
            )}
            <ul className="mt-6 flex-1 space-y-3 border-y border-line py-6">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-[15px] text-fg-muted">
                  <Check className="h-4 w-4 shrink-0 text-mint-ink" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={product.highlight ? 'primary' : 'outline'}
              size="md"
              className="mt-6 w-full"
              onClick={() => customise(product)}
              aria-label={`Customise ${product.name} in the quote builder`}
            >
              Customise this <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </article>
        ))}
      </div>
        )}
      </QueryState>
    </Section>
  );
}
