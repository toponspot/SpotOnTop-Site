/**
 * DEMO DATA · GET /slots
 * Website placements. `rate` is { INR, USD } before GST, read from src/config/pricing.json
 * for the current mode (launch | full). `founding` marks slots that carry the founding offer.
 * `statusLabel` is the badge copy; `quotable` slots appear in the quote builder;
 * `showInWalkthrough` picks the three slots shown in "How it works", step 1.
 * `boardSize` lays the slot out on the banner board: 'hero' | 'wide' | 'half'.
 */
import { FOUNDING_ACTIVE, PRICING, slotPrice } from './priceBook.js';

const FOUNDING = PRICING.founding;
const homeTopTaken = FOUNDING.placesTaken;
const homeTopLeft = Math.max(0, FOUNDING.placesTotal - homeTopTaken);

export const SLOTS = [
  {
    id: 'home-top',
    boardSize: 'hero',
    showInWalkthrough: true,
    name: 'Home top banner',
    shortName: 'Home top',
    description: 'Rotating, first screen',
    detail: 'The first thing every visitor sees. Four brands rotate in the hero, each with a Sponsored label and its own report.',
    places: FOUNDING.placesTotal,
    taken: homeTopTaken,
    rate: slotPrice('home-top'),
    unit: PRICING.slots['home-top'].unit,
    founding: FOUNDING_ACTIVE,
    statusLabel: homeTopLeft > 0 ? `${homeTopLeft} ${homeTopLeft === 1 ? 'place' : 'places'} open` : 'Booked',
    quotable: true,
  },
  {
    id: 'home-middle',
    boardSize: 'wide',
    showInWalkthrough: true,
    name: 'Home middle banner',
    shortName: 'Home middle',
    description: 'Beside the live traffic board',
    detail: 'Sits beside the live traffic board, where visitors already look at the numbers.',
    places: 1,
    taken: 0,
    rate: slotPrice('home-middle'),
    unit: PRICING.slots['home-middle'].unit,
    founding: FOUNDING_ACTIVE,
    statusLabel: 'Open',
    quotable: true,
  },
  {
    id: 'newsletter',
    boardSize: 'wide',
    name: 'Newsletter',
    shortName: 'Newsletter',
    description: 'Weekly, premium readers',
    detail: 'One sponsor per weekly issue, sent to founders and buyers who asked for it. Booked for this cycle.',
    places: 1,
    taken: 1,
    rate: slotPrice('newsletter'),
    unit: PRICING.slots.newsletter.unit,
    founding: FOUNDING_ACTIVE,
    statusLabel: 'Booked',
    quotable: false,
  },
  {
    id: 'category',
    boardSize: 'half',
    name: 'Category page banner',
    shortName: 'Category page',
    description: 'Food, fashion, property, tech',
    detail: 'Shown at the top of one category page, so your banner meets buyers already browsing your field.',
    places: 2,
    taken: 1,
    rate: slotPrice('category'),
    unit: PRICING.slots.category.unit,
    founding: FOUNDING_ACTIVE && PRICING.slots.category.founding !== false,
    statusLabel: '1 of 2 open',
    quotable: true,
  },
  {
    id: 'article-inline',
    boardSize: 'half',
    showInWalkthrough: true,
    name: 'Article inline banner',
    shortName: 'Article inline',
    description: 'Inside founder stories',
    detail: 'Placed inside long-form founder stories, which readers finish end to end.',
    places: 1,
    taken: 0,
    rate: slotPrice('article-inline'),
    unit: PRICING.slots['article-inline'].unit,
    founding: FOUNDING_ACTIVE,
    statusLabel: 'Open',
    quotable: true,
  },
];
