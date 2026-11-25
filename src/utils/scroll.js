/** Every section the page can scroll to. Each one is reachable at /<id>. */
export const SECTION_IDS = [
  'how-it-works',
  'spots',
  'live-traffic',
  'banner-board',
  'brands',
  'banner-panel',
  'community-pick',
  'pricing',
  'quote-builder',
  'faq',
  'join',
];

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** "pricing" → "/pricing". */
export function pathForSection(id) {
  return `/${id}`;
}

/** "/pricing/" → "pricing". Returns '' for "/" or an unknown path. */
export function sectionFromPath(pathname) {
  let id = pathname.replace(/^\/+|\/+$/g, '');
  try {
    id = decodeURIComponent(id);
  } catch {
    return '';
  }
  return SECTION_IDS.includes(id) ? id : '';
}

/** Scrolls the page to a section. Only scrolls; changing the URL is the router's job. */
export function scrollToElement(id, behavior = 'smooth') {
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ behavior: prefersReducedMotion() && behavior === 'smooth' ? 'auto' : behavior, block: 'start' });
  return true;
}