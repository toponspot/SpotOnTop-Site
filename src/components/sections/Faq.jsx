import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { cn } from '../../utils/cn';
import { pathForSection } from '../../utils/scroll';
import { ErrorState, Skeleton } from '../ui/AsyncState';
import { Section } from '../ui/Section';

export function Faq() {
  const [openIndex, setOpenIndex] = useState(0);
  // GET /faqs
  const faqsQuery = useApiQuery('faqs');

  return (
    <Section id="faq" tone={800} aria-labelledby="faq-title">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <p className="caps text-[11px] font-extrabold text-accent sm:text-xs">FAQ</p>
          <h2 id="faq-title" className="mt-4 text-[32px] font-extrabold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[40px] lg:text-[55px]">
            Clear answers
            <br />
            <span className="text-accent">before you book.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-fg-muted sm:text-lg lg:text-xl">
            The things brands ask us most. Can’t find yours?{' '}
            <Link
              to={pathForSection('join')}
              className="text-fg underline decoration-gold decoration-2 underline-offset-4 hover:text-accent"
            >
              Write to us from the form below.
            </Link>
          </p>
        </div>

        <div className="border-t border-line">
          {faqsQuery.error && !faqsQuery.data && (
            <ErrorState className="mt-6" error={faqsQuery.error} onRetry={faqsQuery.refetch} title="Couldn’t load the FAQ." />
          )}
          {!faqsQuery.data &&
            !faqsQuery.error &&
            [0, 1, 2, 3, 4].map((index) => <Skeleton key={index} className="my-5 h-8 w-full" />)}
          {(faqsQuery.data ?? []).map((item, index) => {
            const open = openIndex === index;
            const buttonId = `faq-button-${index}`;
            const panelId = `faq-panel-${index}`;
            return (
              <div key={item.question} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? -1 : index)}
                    className="-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 px-3 py-6 text-left transition-colors hover:bg-ink-800"
                  >
                    <span className={cn('w-8 shrink-0 text-base font-bold tabular sm:text-lg', open ? 'text-accent' : 'text-fg-subtle')}>
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                    <span className="flex-1 text-base font-bold text-fg sm:text-lg">{item.question}</span>
                    {open ? (
                      <X className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    )}
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn('grid transition-[grid-template-rows] duration-200 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
                >
                  <div className={cn('overflow-hidden', open ? 'visible' : 'invisible')}>
                    <p className="pb-6 pr-8 text-[15px] leading-relaxed text-fg-muted">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
