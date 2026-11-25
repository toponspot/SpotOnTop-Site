/**
 * DEMO DATA · GET /brand-profile  ·  PUT /brand-profile
 * The signed-in brand's details, shown in the Brand Panel and its previews,
 * plus the weekly report figures used in "How it works", step 4.
 */
export const BRAND_PROFILE = {
  name: 'Harlow & Pine',
  pitch: 'Small-batch pantry staples from Oregon, now shipping to India.',
  email: 'trade@harlowpine.example',
  contactName: 'Priya Ellison',
  phone: '+1 0000 00142',
  location: 'Portland, Oregon',
  region: 'Oregon, USA',
  stats: {
    views: 2140,
    clicks: 164,
    enquiries: 87,
    weeklyViews: [38, 52, 47, 61, 70, 66, 82],
  },
};
