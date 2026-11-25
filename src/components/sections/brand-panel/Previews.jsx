import { ArrowRight, ArrowUpRight, Bookmark, Heart, Mail, MapPin, MessageCircle, MoreHorizontal, Search, Send } from 'lucide-react';
import instagramPantry from '../../../assets/images/instagram-pantry.webp';
// import { formatNumber, formatPercent } from '../../../utils/currency';
// import { Avatar, initialsFrom } from '../../ui/Avatar';

export function monogramFor(name) {
  const parts = String(name).split(/\s+/).filter((word) => word && word !== '&');
  if (parts.length === 0) return 'yb';
  if (name.includes('&') && parts.length >= 2) return `${parts[0][0]}&${parts[1][0]}`.toLowerCase();
  return parts
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toLowerCase();
}

export function handleFor(name) {
  return String(name).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '') || 'yourbrand';
}

/** Instagram feed post. Fixed cream palette: it is a creative, not themed UI. */
export function InstagramPreview({ brand }) {
  return (
    <figure className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl bg-[#FBF8F1] text-[#1F2A1F] shadow-card">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2F3B2C] font-serif text-[11px] text-[#F4EBDD]">
          {monogramFor(brand.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold">{handleFor(brand.name)}</p>
          <p className="truncate text-[11px] text-[#6B6B5E]">{brand.location ? `${brand.location} · ` : ''}Example account</p>
        </div>
        <MoreHorizontal className="h-4 w-4 text-[#3B3B33]" aria-hidden="true" />
      </div>
      <div className="bg-[#EFE6D3] px-5 pb-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 break-words font-serif text-xl">{brand.name}</p>
          <p className="mt-1.5 shrink-0 text-[9px] font-bold uppercase tracking-[0.18em]">{brand.region}</p>
        </div>
        <p className="mt-3 font-serif text-[28px] leading-[1.06] sm:text-[32px]">
          Good things.
          <br />
          Worth passing around.
        </p>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em]">Small batches. Now shipping to India.</p>
      </div>
      <img
        src={instagramPantry}
        alt="Olive oil, honey jars, bread and oranges on a wooden table"
        className="aspect-[1100/614] w-full object-cover"
        loading="lazy"
      />
      <div className="flex items-center gap-3 px-3.5 pt-3 text-[#1F2A1F]" aria-hidden="true">
        <Heart className="h-5 w-5" />
        <MessageCircle className="h-5 w-5" />
        <Send className="h-5 w-5" />
        <Bookmark className="ml-auto h-5 w-5" />
      </div>
      <figcaption className="px-3.5 pb-3.5 pt-2 text-xs leading-relaxed">
        <strong>{brand.name}</strong> · {brand.pitch}
      </figcaption>
    </figure>
  );
}

// export function ListingPreview({ brand }) {
//   return (
//     <article className="mx-auto w-full max-w-[360px] rounded-[22px] border border-line bg-ink-800 p-6 shadow-card">
//       <Avatar initials={initialsFrom(brand.name)} tone="mint" />
//       <div className="mt-6 flex items-start justify-between gap-3">
//         <h4 className="min-w-0 break-words font-display text-lg font-medium text-fg">{brand.name}</h4>
//         <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-mint-ink">
//           <Check className="h-3.5 w-3.5" aria-hidden="true" /> Verified demo
//         </span>
//       </div>
//       <p className="mt-3 text-sm leading-relaxed text-fg-muted">{brand.pitch}</p>
//       <dl className="mt-5 grid grid-cols-3 gap-2">
//         {[
//           ['Views', formatNumber(brand.stats?.views ?? 0)],
//           ['Clicks', formatNumber(brand.stats?.clicks ?? 0)],
//           ['Rate', formatPercent(brand.stats?.views ? brand.stats.clicks / brand.stats.views : 0)],
//         ].map(([label, value]) => (
//           <div key={label}>
//             <dt className="text-xs text-fg-muted">{label}</dt>
//             <dd className="mt-1 text-lg font-bold tabular-nums text-fg">{value}</dd>
//           </div>
//         ))}
//       </dl>
//       <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-sm text-fg-muted">
//         <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
//         <span className="truncate">{brand.email}</span>
//       </p>
//     </article>
//   );
// }

// export function HomeBannerPreview({ brand }) {
//   return (
//     <div className="mx-auto w-full max-w-[640px] [container-type:inline-size]">
//       <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2A1670] via-[#4B2CA8] to-[#6D46D8] p-[6cqw] text-white shadow-card">
//         <div aria-hidden="true" className="absolute -right-[10cqw] -top-[14cqw] h-[48cqw] w-[48cqw] rounded-full bg-white/10" />
//         <div aria-hidden="true" className="absolute -bottom-[18cqw] right-[12cqw] h-[36cqw] w-[36cqw] rounded-full bg-gold/20" />
//         <span className="relative inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em]">
//           Sponsored <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" /> {brand.name}
//         </span>
//         <p className="relative mt-[4cqw] max-w-[80%] break-words font-sans text-[length:6.4cqw] font-bold leading-[1.05] tracking-tight">{brand.name}</p>
//         <p className="relative mt-[2.5cqw] max-w-[78%] text-[length:2.6cqw] leading-snug text-white/85">{brand.pitch}</p>
//         <div className="relative mt-[5cqw] flex flex-wrap items-center gap-3">
//           <span className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[13px] font-bold text-navy">
//             See contact <ArrowRight className="h-4 w-4" aria-hidden="true" />
//           </span>
//           <span className="truncate text-xs text-white/75">{brand.email}</span>
//         </div>
//       </div>
//       <p className="mt-3 text-center text-xs text-fg-subtle">Home top banner, desktop. Rotates with three other brands.</p>
//     </div>
//   );
// }

/*
 * Website listing + home banner previews. Like the Instagram post, these are fixed-palette
 * creatives (cream / forest green), not themed UI. Every size is a share of the card's own
 * width (cqw), so the card keeps the Figma proportions at any panel width; `cq` adds a
 * pixel floor so small text stays readable on phones.
 */
const cq = (value, min = 0) => `max(${min}px, ${value}cqw)`;

const CREAM = 'bg-[#FBF8F1]';
const INK = 'text-[#2E382C]';

/** Brand directory page: header strip, photo, brand name, headline, pitch, tags and contact row. */
export function ListingPreview({ brand }) {
  return (
    <div className="mx-auto w-full max-w-[760px] [container-type:inline-size]">
      <article className={`overflow-hidden rounded-md ${CREAM} ${INK}`}>
        <div className="flex items-center justify-between gap-3 px-[2.6cqw] py-[1.6cqw]">
          <p className="font-sans font-extrabold uppercase tracking-[0.02em]" style={{ fontSize: cq(1.15, 9) }}>
            The brand directory
          </p>
          <p className="truncate text-[#6F6B5F]" style={{ fontSize: cq(1.1, 9) }}>
            Food &amp; drink / Pantry
          </p>
        </div>

        <div className="relative">
          <img
            src={instagramPantry}
            alt="Olive oil, honey and marmalade jars on a linen cloth in warm kitchen light"
            className="aspect-[16/6] w-full object-cover [object-position:50%_62%] sm:aspect-[1300/334]"
            loading="lazy"
          />
          <span
            className="absolute left-[2.6cqw] top-[2cqw] rounded-full bg-[#F3EBDB]/90 px-[2cqw] py-[0.75cqw] font-sans font-extrabold uppercase tracking-[0.1em]"
            style={{ fontSize: cq(0.85, 7.5) }}
          >
            Meet your new pantry favourites
          </span>
        </div>

        <div className="px-[2.6cqw] pb-[2.7cqw] pt-[3cqw]">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 break-words font-serif leading-tight" style={{ fontSize: cq(2.85, 15) }}>
              {brand.name}
            </p>
            {brand.region && (
              <p className="mt-[0.7cqw] flex shrink-0 items-center gap-[0.5cqw] text-[#6F6B5F]" style={{ fontSize: cq(1.1, 9.5) }}>
                <MapPin className="h-[1.2em] w-[1.2em]" aria-hidden="true" />
                {brand.region}
              </p>
            )}
          </div>
          <p className="mt-[2cqw] font-serif leading-[1.15] tracking-[-0.015em]" style={{ fontSize: cq(3.1, 17) }}>
            A little Oregon. In every cupboard.
          </p>
          <p className="mt-[2cqw] break-words text-[#6F6B5F]" style={{ fontSize: cq(1.28, 10.5) }}>
            {brand.pitch}
          </p>
          <ul className="mt-[1.8cqw] flex flex-wrap gap-[0.8cqw]">
            {['Small-batch', 'Pantry essentials', 'Ships to India'].map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-[#F0E8D7] px-[1.2cqw] py-[0.55cqw] font-medium"
                style={{ fontSize: cq(0.96, 9.5) }}
              >
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-[2.5cqw] flex flex-wrap items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-[0.7cqw]" style={{ fontSize: cq(1.23, 10.5) }}>
              <Mail className="h-[1.1em] w-[1.1em] shrink-0" aria-hidden="true" />
              <span className="truncate">{brand.email}</span>
            </p>
            <span
              className="inline-flex shrink-0 items-center gap-[1cqw] rounded-md bg-[#354532] px-[1.6cqw] py-[1.1cqw] font-semibold text-[#F3ECDD]"
              style={{ fontSize: cq(1.15, 10.5) }}
            >
              Explore brand <ArrowUpRight className="h-[1.1em] w-[1.1em]" aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}

/** Home page mock: browser bar, site nav, forest-green hero with photo, carousel dots, next-up strip. */
export function HomeBannerPreview({ brand }) {
  return (
    <div className="mx-auto w-full max-w-[760px] [container-type:inline-size]">
      <div className={`overflow-hidden rounded-md ${CREAM} ${INK}`}>
        <div className="flex items-center bg-[#E9E5DC] px-[2cqw] py-[1.1cqw]" aria-hidden="true">
          <span className="flex w-[8cqw] gap-[0.7cqw]">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="h-[0.65cqw] w-[0.65cqw] min-h-[4px] min-w-[4px] rounded-full bg-[#B4B1A7]" />
            ))}
          </span>
          <span className="flex-1 truncate text-center text-[#8C887D]" style={{ fontSize: cq(0.92, 7.5) }}>
            Preview / Home / Featured brand
          </span>
          <span className="w-[8cqw]" />
        </div>

        <div className="flex items-center justify-between px-[2.8cqw] py-[1.9cqw]">
          <p className="font-sans font-extrabold tracking-tight" style={{ fontSize: cq(1.5, 10.5) }}>
            spot on top.
          </p>
          <div className="flex items-center gap-[2.2cqw]" style={{ fontSize: cq(1, 8.5) }}>
            <span className="font-semibold">Discover brands</span>
            <span className="text-[#9A968A]">Stories</span>
            <Search className="h-[1.25em] w-[1.25em]" aria-hidden="true" />
          </div>
        </div>

        <div className="flex min-h-[37.2cqw]">
          <div className="min-w-0 flex-1 bg-[#354532] px-[3.1cqw] pb-[2.5cqw] pt-[2.9cqw] text-[#F3ECDD]">
            <p className="font-sans font-bold uppercase tracking-[0.14em] text-[#DCE1D1]" style={{ fontSize: cq(0.9, 7.5) }}>
              The Pantry Edit · Featured brand
            </p>
            <p className="mt-[2cqw] break-words font-serif leading-tight" style={{ fontSize: cq(2.3, 14) }}>
              {brand.name}
            </p>
            <p className="mt-[2.2cqw] font-serif leading-[1.1] tracking-[-0.01em]" style={{ fontSize: cq(3.8, 18) }}>
              Small batch.
              <br />
              Big welcome.
            </p>
            <p className="mt-[1.9cqw] break-words text-[#F3ECDD]/90" style={{ fontSize: cq(1.27, 10) }}>
              {brand.pitch}
            </p>
            <span
              className="mt-[2.1cqw] inline-flex max-w-full items-center gap-[1.6cqw] rounded bg-[#F3ECDD] px-[1.9cqw] py-[1.3cqw] font-semibold text-[#2E382C]"
              style={{ fontSize: cq(1.08, 10) }}
            >
              <span className="truncate">Meet {brand.name}</span>
              <ArrowRight className="h-[1.25em] w-[1.25em] shrink-0" aria-hidden="true" />
            </span>
          </div>
          <img
            src={instagramPantry}
            alt="Olive oil, honey and marmalade jars with an orange on a rustic wooden table"
            className="w-[38.1%] shrink-0 object-cover [object-position:66%_50%]"
            loading="lazy"
          />
        </div>

        <div className="flex items-center justify-center gap-[0.6cqw] pt-[1.9cqw]" aria-hidden="true">
          <span className="h-[0.4cqw] min-h-[3px] w-[2cqw] min-w-[14px] rounded-full bg-[#354532]" />
          <span className="h-[0.5cqw] min-h-[4px] w-[0.5cqw] min-w-[4px] rounded-full bg-[#D1CBBB]" />
          <span className="h-[0.5cqw] min-h-[4px] w-[0.5cqw] min-w-[4px] rounded-full bg-[#D1CBBB]" />
        </div>

        <div className="flex items-end justify-between gap-3 px-[2.85cqw] pb-[2cqw] pt-[1.6cqw]">
          <div className="min-w-0">
            <p className="font-sans font-semibold uppercase tracking-[0.12em] text-[#827D6F]" style={{ fontSize: cq(0.85, 7.5) }}>
              Good taste, great discoveries
            </p>
            <p className="mt-[0.6cqw] font-serif leading-tight tracking-[-0.01em]" style={{ fontSize: cq(2.4, 15) }}>
              Your next everyday favourite.
            </p>
          </div>
          <ArrowUpRight className="mb-[0.8cqw] h-[1.3cqw] min-h-[12px] w-[1.3cqw] min-w-[12px] shrink-0" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
