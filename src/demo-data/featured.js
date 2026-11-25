/**
 * DEMO DATA · GET /featured
 * Sponsored carousel slides, Spot of the Week and the comparison list.
 */
export const FEATURED_SLIDES = [
  {
    id: 'harlow-pine',
    brand: 'Harlow & Pine',
    kind: 'image',
    contact: { name: 'Priya Ellison', role: 'Trade lead', email: 'trade@harlowpine.example', phone: '+1 0000 00142' },
    city: 'Portland, Oregon',
    pitch: 'Small-batch pantry staples from Oregon, now shipping to India.',
  },
  {
    id: 'kaveri-silk',
    brand: 'Kaveri Silk House',
    kind: 'silk',
    contact: { name: 'Meera Iyer', role: 'Export desk', email: 'export@kaverisilk.example', phone: '+91 98400 00087' },
    city: 'Chennai',
    pitch: 'Fourth-generation handloom silks, shipping to the USA this season.',
  },
  {
    id: 'veda-estates',
    brand: 'Veda Estates',
    kind: 'estate',
    contact: { name: 'Arjun Mehta', role: 'Sales director', email: 'visit@vedaestate.example', phone: '+91 98200 00141' },
    city: 'Mumbai',
    pitch: 'Sea-facing residences in South Mumbai. RERA No. DEMO-REG-0000.',
  },
];

export const SPOT_OF_THE_WEEK = {
  initial: 'K',
  name: 'Kaveri Silk House',
  meta: 'Chennai · handloom silks',
  blurb: 'Chosen by our editors, not bought. Fourth-generation weavers shipping to the USA this season.',
  views: 2140,
  enquiries: 87,
};

export const COMPARISON = {
  typical: [
    'No view of who actually saw your banner',
    'Contact details printed once, stale for months',
    'An audience you have to guess at',
    'Prices only on request',
  ],
  spotOn: [
    'Live views and clicks on every banner',
    'Contacts you can change any time, live within 24 hours',
    'Founders, CEOs and buyers in India and the USA',
    'Prices shown upfront, in your currency',
  ],
};
