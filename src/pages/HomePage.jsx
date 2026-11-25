import { lazy } from 'react';
import { Hero } from '../components/sections/Hero';
import { HowItWorks } from '../components/sections/how-it-works/HowItWorks';
import { JoinWaitlist } from '../components/sections/JoinWaitlist';
import { LazySection } from '../components/ui/LazySection';

/**
 * Below-the-fold sections are separate downloads. Each one is fetched shortly before it
 * scrolls into view (see LazySection). The Hero, How it works and the Join form stay in
 * the main bundle: they are on the first screen or are primary calls to action.
 */
const lazySection = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));

const Featured = lazySection(() => import('../components/sections/featured/Featured'), 'Featured');
const LiveTraffic = lazySection(() => import('../components/sections/LiveTraffic'), 'LiveTraffic');
const BannerBoard = lazySection(() => import('../components/sections/BannerBoard'), 'BannerBoard');
const BrandDirectory = lazySection(() => import('../components/sections/BrandDirectory'), 'BrandDirectory');
const BrandPanel = lazySection(() => import('../components/sections/brand-panel/BrandPanel'), 'BrandPanel');
const CommunityPick = lazySection(() => import('../components/sections/CommunityPick'), 'CommunityPick');
const Pricing = lazySection(() => import('../components/sections/Pricing'), 'Pricing');
const QuoteBuilder = lazySection(() => import('../components/sections/QuoteBuilder'), 'QuoteBuilder');
const Faq = lazySection(() => import('../components/sections/Faq'), 'Faq');

/*
 * placeholderClassName = each section's measured height at the site's breakpoints
 * (base, sm 640, md 768, lg 1024, 2xl 1229), so loading a section does not shift the page.
 * Update these if a section's layout changes a lot.
 */
const HEIGHTS = {
  spots: 'min-h-[1260px] sm:min-h-[1380px] md:min-h-[1420px] lg:min-h-[1010px] 2xl:min-h-[1027px]',
  traffic: 'min-h-[1794px] sm:min-h-[1742px] md:min-h-[1742px] lg:min-h-[1121px] 2xl:min-h-[1090px]',
  board: 'min-h-[1650px] sm:min-h-[1680px] md:min-h-[1640px] lg:min-h-[1089px]',
  brands: 'min-h-[3640px] sm:min-h-[2110px] md:min-h-[2090px] lg:min-h-[1305px] 2xl:min-h-[1293px]',
  panel: 'min-h-[1930px] sm:min-h-[2000px] md:min-h-[1975px] lg:min-h-[1235px]',
  community: 'min-h-[860px] sm:min-h-[815px] md:min-h-[815px] lg:min-h-[807px]',
  pricing: 'min-h-[1740px] sm:min-h-[1860px] md:min-h-[875px] lg:min-h-[891px]',
  quote: 'min-h-[2180px] sm:min-h-[1910px] md:min-h-[1870px] lg:min-h-[1212px] 2xl:min-h-[1112px]',
  faq: 'min-h-[875px] sm:min-h-[906px] md:min-h-[906px] lg:min-h-[684px]',
};

/** The full Spot On Top landing page, in the order of the design file. */
export function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <LazySection id="spots" tone={850} placeholderClassName={HEIGHTS.spots}>
        <Featured />
      </LazySection>
      <LazySection id="live-traffic" tone={900} placeholderClassName={HEIGHTS.traffic}>
        <LiveTraffic />
      </LazySection>
      <LazySection id="banner-board" tone={800} placeholderClassName={HEIGHTS.board}>
        <BannerBoard />
      </LazySection>
      <LazySection id="brands" tone={900} placeholderClassName={HEIGHTS.brands}>
        <BrandDirectory />
      </LazySection>
      <LazySection id="banner-panel" tone={800} placeholderClassName={HEIGHTS.panel}>
        <BrandPanel />
      </LazySection>
      <LazySection id="community-pick" tone={900} placeholderClassName={HEIGHTS.community}>
        <CommunityPick />
      </LazySection>
      <LazySection id="pricing" tone={800} placeholderClassName={HEIGHTS.pricing}>
        <Pricing />
      </LazySection>
      <LazySection id="quote-builder" tone={900} placeholderClassName={HEIGHTS.quote}>
        <QuoteBuilder />
      </LazySection>
      <LazySection id="faq" tone={800} placeholderClassName={HEIGHTS.faq}>
        <Faq />
      </LazySection>
      <JoinWaitlist />
    </>
  );
}