# CLAUDE.md — Spot On Top project context

Read this file fully before touching any code. It explains what the project is, how it is built,
the rules I must follow, and the current state. The owner should not have to re-explain any of it.

## 1. What this project is

**Spot On Top** is a single-page marketing + demo site for a billboard-style advertising marketplace
connecting brands with audiences in **India and the USA**. Brands can browse banner slots, watch
live-traffic numbers, build a price quote, edit a brand profile, vote in a community pick, and join a waitlist.

- Repo: https://github.com/NavinSingh1/Spot-On-Top-Site
- It is a **demo/prototype**: all data is placeholder and clearly labelled "Sample data · demo".
- Client/agency: handover prepared by **Orator Hype Private Limited**. Questions about design intent go to Aryan (Orator Hype).
- Footer line on outward pages: "Prepared by Orator Hype Private Limited".

## 2. Stack and commands

React 18.3.1 · Vite 5.4.11 · Tailwind CSS 3.4.17 · lucide-react 0.468.0 · react-router-dom ·
`@fontsource/plus-jakarta-sans` 5.1.0. All dependencies are pinned to exact versions. No data-fetching,
animation or state library; do not add one without being asked.

```bash
npm install
npm run dev        # http://localhost:5173 — demo data
npm run build      # must pass before any work is considered done
npm run preview    # serve the production build
npm run mock-api   # local REST mock on :8787 (FAIL=faqs,pricing makes endpoints return 500)
```

There is no lint or unit-test script. Verification is: build passes + look at it in a browser (see section 10).

## 3. Rules of engagement (defaults unless the owner says otherwise)

1. **UI work does not touch data or logic.** Do not change `src/demo-data/*`, `src/services/*`, `src/utils/*`,
   `src/hooks/*`, `src/config/*`, API endpoints, business logic, state flow, routing, or form submission logic
   when the task is visual. If a data/logic change seems necessary, do not make it; explain it in the final report.
2. **Never copy numbers/prices/names from design mockups into the site** (prices come from `src/config/pricing.json`). Mockups show different sample values
   (63 visitors, ₹40,000, ₹5,35,248…). The site shows whatever `demo-data` or the API returns.
3. **Preserve functionality.** Restyling must keep handlers, props, state and a11y attributes intact.
4. **Keep architecture.** Reuse existing components; no new dependencies, no renames, no unrelated edits.
5. **Do not claim something was tested if it was not.** Say what was and was not run.
6. Output language and tone for the owner: plain, direct, no jargon dumps.
7. When asked for a finished project, deliver a **zip without `node_modules`, `dist`, `.git`** that works after
   `npm install && npm run dev`, and a short report listing changed files.

## 4. Page structure

One route (`/`) renders `src/pages/HomePage.jsx`, sections in this order (id → component):

| id | Component | Tone (bg) | Notes |
| --- | --- | --- | --- |
| `top` | `sections/Hero.jsx` | `ink-950` | Live card with globe, show-me chooser (USA/India) |
| `how-it-works` | `sections/how-it-works/HowItWorks.jsx` + `StepPanels.jsx` | 900 | Auto-advancing 4-step story |
| `spots` | `sections/featured/Featured.jsx` + `Creatives.jsx` | 850 | Rotating sponsored banners, spot of the week, Typical vs On Spot On |
| `live-traffic` | `sections/LiveTraffic.jsx` | 900 | KPI cards, globe card + cities panel (tabs), full-width 24h chart |
| `banner-board` | `sections/BannerBoard.jsx` | 800 | Slot inventory + inspector, "Build my quote" |
| `brands` | `sections/BrandDirectory.jsx` | 900 | Filter / search / sort, inline contact reveal |
| `banner-panel` | `sections/brand-panel/BrandPanel.jsx` + `Previews.jsx` | 800 | Edit once, update everywhere |
| `community-pick` | `sections/CommunityPick.jsx` | 900 | Optimistic voting, FLIP reorder |
| `pricing` | `sections/Pricing.jsx` | 800 | 3 product cards, currency aware |
| `quote-builder` | `sections/QuoteBuilder.jsx` | 900 | 4-step estimate, `QuoteRequestModal` |
| `faq` | `sections/Faq.jsx` | 800 | Accordion |
| `join` | `sections/JoinWaitlist.jsx` | yellow band | Waitlist form |

Hero, How it works and Join are in the main bundle; the others are `React.lazy` + `ui/LazySection.jsx`
(fetched shortly before scrolling into view). Layout shell: `layout/Navbar.jsx`, `layout/Footer.jsx`,
`layout/ScrollManager.jsx`. Section deep links go through `utils/scroll.js` (`pathForSection`) and `hooks/useGoToSection.js`.

Modals: `modals/ContactModal.jsx` (opened from featured banners via `UIContext.openContact`),
`modals/QuoteRequestModal.jsx`. Brand directory cards reveal contact **inline**, not in a modal.

## 5. Data flow (do not bypass)

```
component → useApiQuery('name') / useApiMutation('name')
          → services/api.js callApi()
              ├─ demo → services/demo/demoApi.js → demo-data/*   (default)
              └─ live → services/apiClient.js (fetch) → services/adapters.js (reshape)
```

- Components never import data files directly; they name an endpoint.
- Single config file: `src/config/api.config.js` (base URL, per-endpoint path and `demo` flag, polling, auth).
  `.env`: `VITE_API_BASE_URL`, `VITE_USE_DEMO_DATA`, `VITE_API_TOKEN` (public tokens only).
- Queries with the same name + params share one request (`services/queryStore.js`). Hero and Live Traffic both use
  `trafficSnapshot` `{market:'all'}`.
- Demo numbers re-roll on each fetch, so two readings of "the same" stat can differ momentarily. Existing behaviour.
- Endpoints: `appSettings, heroStats, trafficSnapshot, slots, brands, featured, votes, pricing, quoteOptions, faqs,
  brandProfile, waitlistOptions, requestQuote, saveBrandProfile, castVote, joinWaitlist, recordContactView`.
  Full table with shapes is in `README.md`.
- Contexts (`src/context/`): `SettingsContext` (theme, currency, USD rate, GST; has `meta theme-color` hex values),
  `QuoteContext` (catalog + builder state), `UIContext` (toasts, contact card), composed in `AppProviders.jsx`.

## 6. Design system (Final design handover v2.1: dark + yellow, Plus Jakarta Sans)

Source of truth: the "Spot On Top · Final design handover v2.1" PDF (13 desktop before/after pages + checklist +
developer notes). It contains **no mobile mockups and no animation pages**; mobile was built from its rules
(390px, 24px side padding, 8px grid, 64px between sections).

Tokens live in `src/styles/index.css` (CSS variables, dark + `:root.light`) and `tailwind.config.js`:

| Token | Dark | Use |
| --- | --- | --- |
| `ink-950` | `#1F1F1E` | main bg, alternate sections |
| `ink-900` / `section-a` | `#262624` | alternate sections, inner rows, inputs |
| `ink-800` | `#30302E` | cards / panels |
| `ink-750` | `#3A3A37` | hover / selected |
| `line` | `#3D3D3A` | borders |
| `fg` / `fg-muted` / `fg-subtle` | `#F5F4EE` / `#C2C0B6` / `#A8A69C` | text |
| `gold` | `#FFC72C`, gradient `#FFD24D → #F2B100` | accent, primary buttons, selected, progress |
| `mint` | `#7FD3A8` | success; text/outline/dots only, never filled bg |
| `iris` | `#8FA3D6` | USA accent and "Booked" (NO purple) |
| `coral` | `#E5534B` | errors, LIVE |
| `navy` | `#262624` | dark text on yellow |

Old token names (`iris`, `mint`, `coral`, `navy`) were intentionally kept; only values changed. Never introduce purple,
bright green fills, champagne gold, italics for accents, or another font family.

Rules: Plus Jakarta Sans only (800 headlines, tabular numbers for live/money figures, accent words yellow and upright);
square or 2px corners (Tailwind radius scale is overridden so every `rounded-*` is 2px; only `rounded-full` stays round:
dots, avatars, thin tracks); 1px borders; no heavy shadows; one thin-line icon set (lucide, strokeWidth 1.5) with a
yellow accent dot; buttons are caps with `tracking-[0.14em]`; selected tab/pill = yellow gradient + dark text, others
outlined; status tags are square outlined caps (green open/done, blue booked, yellow selected/pending, red live).

Light theme exists (header toggle). Yellow **text** in light mode must be `#946300` (4.9:1); `#E09A00` only for dots/lines/icons.

## 7. Gotchas that will bite you

- **`cn()` is a plain class joiner (no tailwind-merge).** Conflicting classes are resolved by CSS order, not by position.
  Avoid passing a conflicting class via `className`; use `!` important prefix only when unavoidable (e.g. BrandPanel tabs).
- **80% page scale on desktop:** `html { zoom: 0.8 }` from 1024px (`src/styles/index.css`) with `PAGE_ZOOM` in
  `tailwind.config.js`. Change both together. Spec pixel sizes were converted (section h2 = 55 CSS px ≈ 44px on screen;
  hero h1 = 115px at 2xl). Breakpoints are custom: xl = 1024, 2xl = 1229. Below 1024px no zoom, literal sizes.
- **Section backgrounds:** `Section`/`LazySection` tones 900 → `section-a` (#262624); 850 and 800 → `section-b` (#1F1F1E).
  Top-level cards are `ink-800`; inner rows/inputs `ink-900`. Do not put an `ink-900` card on an `ink-900` section.
- **Scroll reveal:** `ui/Section.jsx` wraps content in `.reveal` (opacity/transform only; forced visible with reduced motion).
- **Grid overflow on phones:** single-column grids need `grid-cols-[minmax(0,1fr)]` or children get `min-w-0`.
- **`SegmentedControl`:** `stretch` = joined bar; default = separate outlined buttons that wrap. `tone` light = gold.
- **Globe (`ui/Globe.jsx`)** is a canvas drawn from `assets/globe-land.js` (2° land bitmask). It only draws cities listed in
  its `COORDS` table; a new city name from the API shows in lists/bars but not on the globe until added there.
  It pauses off-screen / tab hidden and is a still frame with reduced motion.
- **Example creatives** (`Previews.jsx`, `Creatives.jsx`) are advertiser content and must stay as supplied. Serif in the
  previews falls back to Georgia (Lora was removed).
- `ui/Flag.jsx` and `assets/images/flag-*.webp` are unused now (landmark icons replaced flags); safe to delete when asked.
- Brand data uses `tone: 'gold' | 'iris' | 'coral' | 'mint'`; `ui/Avatar.jsx` maps those keys to the softened palette.

## 8. Current state / known follow-ups

Done: full v2.1 redesign of header, hero, all 11 sections, modals, footer; dark + light; responsive 360–1920; globe,
landmarks, seal, header shrink + progress line, scroll reveal, KPI count-up, chart draw, shake on validation errors.

Open items (not done, pick up if asked):
- **TODO:** `HEIGHTS` placeholder min-heights in `src/pages/HomePage.jsx` were measured for the OLD layout. Live Traffic
  (and others) changed height, so measure the new heights at base/640/768/1024/1229 and update them to avoid layout shift.
- Animations from the handover's missing animation pages (loading hook, page transition, etc.) are not built.
- Option B pricing is applied. ALL prices live in `src/config/pricing.json`; change `"mode"` from `launch` to `full` to
  switch every screen. Open items: the Category page banner has no price in the pricing checklist (kept at its old rate,
  flagged in the JSON); USD tax rule is pending ("Taxes as applicable" shown).
- Not yet run: Lighthouse (target mobile 85+ with globe on screen), formal reduced-motion run, keyboard-only audit,
  Safari/Firefox, real-API mode regression after the redesign.
- Acceptance list from the handover: no purple / bright green fill / champagne gold / italic accents; only Plus Jakarta
  Sans loads (no Google Fonts); the same numbers on the home card and Live traffic; "Sample data · demo" visible while data
  is demo; cities only on globe/feed, never a person or IP.

## 9. Conventions

- Function components + hooks, named exports for sections/UI, default exports only where the file already uses them.
- Tailwind utility classes; tokens over hex values (hex only for brand constants like `#FFC72C`).
- Motion: only `transform`/`opacity` (plus the existing `clip-path` chart draw), under 600 ms, honour `prefers-reduced-motion`.
- Accessibility: keep roles/aria on tabs, radio groups, accordions, dialogs; visible `:focus-visible` ring (yellow).
- Comments explain *why*; match the existing comment style. No `localStorage` keys renamed (persisted state uses `utils/storage.js`).

## 10. How to verify work

1. `npm run build` must succeed.
2. Look at it in a browser at 390, 768 and 1280 px, dark and light (header toggle). If a headless browser is available
   (Playwright/Chromium), build, run `npx vite preview --port 4173` and screenshot; scroll the page first so lazy sections load.
3. Check no horizontal overflow: `document.documentElement.scrollWidth <= window.innerWidth` at 360/390/430/768.
4. Click through: currency INR/USD, quote builder (choices change the estimate; empty brand shows an error), FAQ, voting,
   contact modal, brand-panel save (reaches 3 of 3), mobile menu, theme toggle.
5. `git diff --stat -- src/demo-data src/services src/utils src/hooks src/config` should be empty for UI-only tasks.

## 11. Starting a new task: prompt template for the owner

> Read CLAUDE.md first. Task: <what you want>. Scope: <UI only / UI + data / etc.>. Deliver: <code changes / zip / report>.

If the task is ambiguous, ask one short question; otherwise state assumptions in one line and proceed.