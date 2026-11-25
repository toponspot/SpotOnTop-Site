import { ArrowRight } from 'lucide-react';
import harlowPineBanner from '../../../assets/images/harlow-pine-banner.webp';
import { cn } from '../../../utils/cn';

/*
  Sponsored banner creatives. Sizes use container query units (cqw) so a
  creative keeps its proportions in the featured carousel, the hero preview
  and any other slot it is dropped into.
*/

function CreativeShell({ className, children }) {
  return (
    <div className={cn('relative h-full w-full overflow-hidden [container-type:inline-size]', className)}>
      {children}
    </div>
  );
}

function SponsoredChip({ brand }) {
  return (
    <span className="inline-flex items-center gap-[0.9cqw] self-start rounded-full bg-black/25 px-[1.6cqw] py-[0.75cqw] text-[length:1.25cqw] font-bold uppercase tracking-[0.08em] text-white">
      Sponsored <span className="h-[0.55cqw] w-[0.55cqw] rounded-full bg-gold" aria-hidden="true" /> {brand}
    </span>
  );
}

function SeeContactButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="mt-[3cqw] inline-flex items-center gap-[1.2cqw] self-start rounded-[1.1cqw] bg-white px-[2.6cqw] py-[1.3cqw] text-[length:1.65cqw] font-bold text-navy shadow-lg transition-transform hover:-translate-y-0.5"
    >
      See contact <ArrowRight className="h-[2.2cqw] w-[2.2cqw]" aria-hidden="true" />
    </button>
  );
}

/** Harlow & Pine: the supplied creative, with a real button over its baked-in CTA. */
export function HarlowPineCreative({ onSeeContact, className }) {
  return (
    <CreativeShell className={cn('bg-[#4B2CA8]', className)}>
      <img
        src={harlowPineBanner}
        alt="Sponsored, Harlow & Pine. Now in India: pantry staples, from Oregon. Looking for importers and gourmet retailers. Ask for the sample box."
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        draggable="false"
      />
      {onSeeContact && (
        <button
          type="button"
          onClick={onSeeContact}
          aria-label="See contact for Harlow & Pine"
          className="absolute left-[5.4%] top-[71%] h-[10.2%] w-[20%] rounded-[1.1cqw] transition-colors hover:bg-white/10"
        />
      )}
    </CreativeShell>
  );
}

function SilkArt() {
  return (
    <svg viewBox="0 0 600 640" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="ks-halo" cx="50%" cy="45%" r="50%">
          <stop offset="0" stopColor="#F5B52E" stopOpacity="0.38" />
          <stop offset="1" stopColor="#F5B52E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ks-silk-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F05B8D" />
          <stop offset="0.5" stopColor="#B7194F" />
          <stop offset="1" stopColor="#6E0B33" />
        </linearGradient>
        <linearGradient id="ks-silk-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2BC49A" />
          <stop offset="0.55" stopColor="#0F7A63" />
          <stop offset="1" stopColor="#08483B" />
        </linearGradient>
        <linearGradient id="ks-silk-c" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFC15A" />
          <stop offset="0.55" stopColor="#E3801F" />
          <stop offset="1" stopColor="#A64812" />
        </linearGradient>
        <linearGradient id="ks-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <pattern id="ks-zari" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="#C9962A" />
          <path d="M9 3 L15 9 L9 15 L3 9 Z" fill="#F7D98B" />
        </pattern>
      </defs>
      <circle cx="320" cy="300" r="300" fill="url(#ks-halo)" />
      <g fill="none" stroke="#F5B52E" strokeOpacity="0.35">
        <circle cx="320" cy="300" r="230" strokeDasharray="2 12" strokeWidth="3" strokeLinecap="round" />
        <circle cx="320" cy="300" r="175" />
        <circle cx="320" cy="300" r="120" strokeDasharray="1 8" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(320 300)" fill="#F5B52E" fillOpacity="0.55">
        {Array.from({ length: 12 }, (_, index) => (
          <path key={index} d="M0 -98 C10 -80 10 -66 0 -54 C-10 -66 -10 -80 0 -98 Z" transform={`rotate(${index * 30})`} />
        ))}
        <circle r="12" />
      </g>
      <g transform="translate(150 360) rotate(-9)">
        <rect width="400" height="118" rx="16" fill="url(#ks-silk-b)" />
        <rect y="88" width="400" height="22" fill="url(#ks-zari)" />
        <rect width="400" height="118" rx="16" fill="url(#ks-sheen)" />
      </g>
      <g transform="translate(118 432) rotate(-3)">
        <rect width="420" height="118" rx="16" fill="url(#ks-silk-c)" />
        <rect y="88" width="420" height="22" fill="url(#ks-zari)" />
        <rect width="420" height="118" rx="16" fill="url(#ks-sheen)" />
      </g>
      <g transform="translate(96 505) rotate(2)">
        <rect width="450" height="130" rx="16" fill="url(#ks-silk-a)" />
        <rect y="96" width="450" height="24" fill="url(#ks-zari)" />
        <rect width="450" height="130" rx="16" fill="url(#ks-sheen)" />
      </g>
    </svg>
  );
}

export function KaveriSilkCreative({ onSeeContact, compact = false, className }) {
  return (
    <CreativeShell className={cn('bg-gradient-to-br from-[#3F0920] via-[#74123A] to-[#A4264A]', className)}>
      <div className="absolute inset-y-0 right-0 w-[56%]">
        <SilkArt />
      </div>
      <div className="relative flex h-full w-[54%] flex-col justify-center pl-[5.5cqw]">
        <SponsoredChip brand="Kaveri Silk House" />
        <h3 className="mt-[2.6cqw] font-sans text-[length:4.7cqw] font-bold leading-[1.06] tracking-[-0.02em] text-white">
          Chennai handloom,
          <br />
          now woven for <span className="text-gold">New York</span>
        </h3>
        {!compact && (
          <p className="mt-[2cqw] max-w-[40cqw] text-[length:1.6cqw] leading-snug text-white/85">
            Seeking boutique stockists across the USA. Ask for the swatch book.
          </p>
        )}
        {onSeeContact && <SeeContactButton onClick={onSeeContact} label="See contact for Kaveri Silk House" />}
      </div>
    </CreativeShell>
  );
}

function EstateArt() {
  return (
    <svg viewBox="0 0 600 640" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="ve-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3D3C7D" />
          <stop offset="0.45" stopColor="#E0715E" />
          <stop offset="0.72" stopColor="#F7B267" />
        </linearGradient>
        <linearGradient id="ve-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A5D7A" />
          <stop offset="1" stopColor="#062234" />
        </linearGradient>
        <pattern id="ve-windows" width="16" height="20" patternUnits="userSpaceOnUse">
          <rect width="16" height="20" fill="#13304D" />
          <rect x="4" y="5" width="7" height="8" rx="1" fill="#FFD27A" fillOpacity="0.75" />
        </pattern>
        <pattern id="ve-windows-dim" width="16" height="20" patternUnits="userSpaceOnUse">
          <rect width="16" height="20" fill="#0D2540" />
          <rect x="4" y="5" width="7" height="8" rx="1" fill="#FFD27A" fillOpacity="0.3" />
        </pattern>
        <clipPath id="ve-arch">
          <path d="M70 640 V290 A230 230 0 0 1 530 290 V640 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#ve-arch)">
        <rect width="600" height="640" fill="url(#ve-sky)" />
        <circle cx="380" cy="372" r="74" fill="#FFD98A" />
        <circle cx="380" cy="372" r="110" fill="#FFD98A" fillOpacity="0.18" />
        <rect x="96" y="250" width="70" height="230" fill="url(#ve-windows-dim)" />
        <rect x="180" y="190" width="86" height="290" fill="url(#ve-windows)" />
        <rect x="186" y="170" width="74" height="24" fill="#13304D" />
        <rect x="280" y="290" width="60" height="190" fill="url(#ve-windows-dim)" />
        <rect x="430" y="230" width="78" height="250" fill="url(#ve-windows)" />
        <rect x="350" y="330" width="64" height="150" fill="url(#ve-windows-dim)" />
        <rect y="470" width="600" height="170" fill="url(#ve-sea)" />
        <rect x="320" y="474" width="120" height="6" rx="3" fill="#FFD98A" fillOpacity="0.55" />
        <rect x="340" y="490" width="80" height="5" rx="2.5" fill="#FFD98A" fillOpacity="0.35" />
        <g fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round">
          <path d="M90 530 q20 -10 40 0 t40 0 t40 0" />
          <path d="M300 560 q20 -10 40 0 t40 0 t40 0 t40 0" />
          <path d="M140 600 q20 -10 40 0 t40 0 t40 0" />
        </g>
      </g>
      <path d="M70 640 V290 A230 230 0 0 1 530 290 V640" fill="none" stroke="#F5B52E" strokeOpacity="0.6" strokeWidth="3" />
      <path d="M48 640 V290 A252 252 0 0 1 552 290 V640" fill="none" stroke="#F5B52E" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" />
    </svg>
  );
}

export function VedaEstateCreative({ onSeeContact, compact = false, className }) {
  return (
    <CreativeShell className={cn('bg-gradient-to-br from-[#041B2D] via-[#0A3A55] to-[#0F5A6E]', className)}>
      <div className="absolute inset-y-0 right-0 w-[52%]">
        <EstateArt />
      </div>
      <div className="relative flex h-full w-[54%] flex-col justify-center pl-[5.5cqw]">
        <SponsoredChip brand="Veda Estates" />
        <h3 className="mt-[2.6cqw] font-sans text-[length:4.7cqw] font-bold leading-[1.06] tracking-[-0.02em] text-white">
          Sea-facing homes,
          <br />
          in <span className="text-gold">South Mumbai</span>
        </h3>
        {!compact && (
          <p className="mt-[2cqw] max-w-[40cqw] text-[length:1.6cqw] leading-snug text-white/85">
            Private previews for buyers in the USA. RERA No. DEMO-REG-0000.
          </p>
        )}
        {onSeeContact && <SeeContactButton onClick={onSeeContact} label="See contact for Veda Estates" />}
      </div>
    </CreativeShell>
  );
}

/**
 * Any banner supplied by the API as an image URL. The "See contact" button is
 * a real control laid over the image, so it works whatever the artwork shows.
 */
export function ImageCreative({ imageUrl, imageAlt, brand, onSeeContact, className }) {
  return (
    <CreativeShell className={cn('bg-ink-800', className)}>
      <img
        src={imageUrl}
        alt={imageAlt || `Sponsored banner for ${brand}`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        draggable="false"
      />
      {onSeeContact && (
        <div className="absolute bottom-[6cqw] left-[5.5cqw]">
          <SeeContactButton onClick={onSeeContact} label={`See contact for ${brand}`} />
        </div>
      )}
    </CreativeShell>
  );
}

/** Built-in demo creatives, chosen by a slide's `kind`. */
export const CREATIVES = {
  image: HarlowPineCreative,
  silk: KaveriSilkCreative,
  estate: VedaEstateCreative,
};