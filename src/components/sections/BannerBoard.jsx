import { useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';
import { useSettings } from '../../context/SettingsContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useCountUp } from '../../hooks/useCountUp';
import { useInView } from '../../hooks/useInView';
import { cn } from '../../utils/cn';
import { findSlot, isBooked, openPlaces } from '../../utils/slots';
import { QueryState, Skeleton } from '../ui/AsyncState';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { FoundingBadge } from '../ui/FoundingBadge';
import { TextField } from '../ui/Field';
import { Section } from '../ui/Section';
import { Kicker, SectionHeader } from '../ui/SectionHeader';

function CapacityBars({ slot }) {
  return (
    <span className="flex items-center gap-2 text-xs text-fg-muted">
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: slot.places }, (_, index) => (
          <span key={index} className={cn('h-1 w-6 ', index < slot.taken ? 'bg-line-strong' : 'bg-gold')} />
        ))}
      </span>
      {slot.founding && slot.places > 1
        ? `${slot.places} places, ${openPlaces(slot)} left`
        : `${slot.places} ${slot.places === 1 ? 'place' : 'places'}`}
    </span>
  );
}

function SlotTile({ slot, selected, inspected, previewName, onInspect, onSelect, className }) {
  const booked = isBooked(slot);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${slot.name}, ${slot.description}, ${slot.statusLabel}`}
      onMouseEnter={() => onInspect(slot.id)}
      onFocus={() => onInspect(slot.id)}
      onClick={() => onSelect(slot.id)}
      className={cn(
        'group relative flex w-full flex-col justify-between gap-4 border bg-ink-900 p-4 text-left transition-[border-color,box-shadow,background-color] duration-150 sm:p-5',
        selected ? 'border-gold shadow-glow' : inspected ? 'border-line-strong bg-ink-750/60' : 'border-line hover:border-line-strong',
        className,
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-[15px] font-bold text-fg sm:text-base">{slot.name}</span>
          <span className="mt-0.5 block text-xs text-fg-muted sm:text-[13px]">{slot.description}</span>
        </span>
        <Badge tone={booked ? 'iris' : 'open'} size="sm">
          {slot.statusLabel}
        </Badge>
      </span>
      {selected && previewName && (
        <span className="flex animate-rise-in items-center gap-2 self-start rounded-md bg-gold/10 px-2.5 py-1 text-xs font-semibold text-accent">
          <span className="rounded bg-black/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-fg-muted">Sponsored</span>
          {previewName}
        </span>
      )}
      <CapacityBars slot={slot} />
    </button>
  );
}

function Inspector({ slot, mode, previewName, onPreviewChange, onBuild }) {
  const { formatPrice, priceValue } = useSettings();
  const [ref, inView] = useInView({ threshold: 0.3 });
  const animatedRate = useCountUp(priceValue(slot.rate) ?? 0, { start: inView, duration: 700 });
  const booked = isBooked(slot);
  const open = openPlaces(slot);

  return (
    <aside
      ref={ref}
      className="flex h-full flex-col border border-line bg-ink-800 p-6 sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <Kicker>
          <span className={mode === 'inspecting' ? 'text-accent' : 'text-fg-subtle'}>Inspecting</span>
          <span className="text-fg-subtle"> / </span>
          <span className={mode === 'selected' ? 'text-accent' : 'text-fg-subtle'}>Selected slot</span>
        </Kicker>
        <Badge tone={booked ? 'iris' : 'open'} size="sm">
          {booked ? 'Booked' : 'Open'}
        </Badge>
      </div>
      <h3 className="mt-5 text-2xl font-extrabold tracking-[-0.02em] text-fg sm:text-[28px]">{slot.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{slot.detail}</p>

      <p className="mt-6 font-sans text-[40px] font-extrabold leading-none tabular-nums text-accent sm:text-5xl">
        {formatPrice(animatedRate)}
      </p>
      <p className="mt-2 text-sm text-fg-muted">a {slot.unit}, before GST</p>
      {slot.founding && <FoundingBadge className="mt-3" />}

      <div className="mt-6 border-y border-line py-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-fg-muted">
            {slot.taken} of {slot.places} {slot.places === 1 ? 'place' : 'places'} taken
          </span>
          <span className={cn('font-bold', booked ? 'text-iris-ink' : 'text-accent')}>
            {booked ? 'Fully booked' : `${open} ${open === 1 ? 'place' : 'places'} open`}
          </span>
        </div>
        <span className="mt-3 block h-1.5 overflow-hidden bg-line" aria-hidden="true">
          <span
            className={cn('block h-full transition-[width] duration-500', booked ? 'bg-iris' : 'bg-gold')}
            style={{ width: `${Math.max(6, (slot.taken / slot.places) * 100)}%` }}
          />
        </span>
      </div>

      <TextField
        id="board-preview-name"
        className="mt-6"
        label="Preview with your brand name"
        labelClassName="text-fg-muted"
        placeholder="Your brand"
        value={previewName}
        maxLength={32}
        onChange={(event) => onPreviewChange(event.target.value)}
      />

      {/* mt-auto pins the button to the bottom so the panel matches the board's height */}
      <div className="mt-auto pt-8">
        <Button className="w-full" size="lg" disabled={booked} onClick={onBuild}>
          Build my quote for this slot
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-fg-subtle">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          {booked ? `${slot.name} is booked for this cycle. Choose an open placement.` : `Selected: ${slot.name}`}
        </p>
      </div>
    </aside>
  );
}

/** Tile sizes on the mock website, driven by each slot's `boardSize` from the API. */
const BOARD_SIZES = {
  hero: 'min-h-[120px] sm:col-span-2 sm:min-h-[150px]',
  wide: 'sm:col-span-2 sm:min-h-[120px]',
  half: 'sm:min-h-[120px]',
};

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
      <div className="grid gap-3 border border-line bg-ink-800 p-4 sm:grid-cols-2">
        <Skeleton className="h-36 sm:col-span-2" />
        <Skeleton className="h-28 sm:col-span-2" />
        <Skeleton className="h-24 sm:col-span-2" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="min-h-[560px] rounded-sm" />
    </div>
  );
}

function Board({ slots }) {
  const { openQuoteBuilder } = useQuote();
  const defaultId = (slots.find((slot) => slot.id === 'home-middle') ?? slots.find((slot) => !isBooked(slot)) ?? slots[0])?.id;
  const [chosenId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [previewName, setPreviewName] = useState('');

  // Fall back to a valid slot if the API's list changes under the selection.
  const selectedId = findSlot(slots, chosenId) ? chosenId : defaultId;
  const inspectedId = (hoveredId && findSlot(slots, hoveredId) ? hoveredId : null) ?? selectedId;
  const inspectedSlot = findSlot(slots, inspectedId);
  const selectedSlot = findSlot(slots, selectedId);
  const mode = hoveredId && hoveredId !== selectedId ? 'inspecting' : 'selected';

  const onBuild = () => {
    if (!selectedSlot || isBooked(selectedSlot)) return;
    openQuoteBuilder({ slotId: selectedSlot.id, brandName: previewName });
  };

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)] items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
        <div className="rounded-sm border border-line-strong/70 bg-ink-900 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 border-b border-line px-2 pb-3 pt-1">
            <span className="flex items-center gap-3 text-xs text-fg-muted sm:text-[13px]">
              <span className="flex gap-1" aria-hidden="true">
                <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
              </span>
              spotontop.com
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-fg-muted sm:text-[11px]">Website placements</span>
          </div>

          <div
            role="radiogroup"
            aria-label="Website placements"
            onMouseLeave={() => setHoveredId(null)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setHoveredId(null);
            }}
            className="mt-3 grid gap-3 sm:grid-cols-2"
          >
            {slots.map((slot) => (
              <SlotTile
                key={slot.id}
                slot={slot}
                selected={selectedId === slot.id}
                inspected={inspectedId === slot.id}
                previewName={previewName}
                onInspect={setHoveredId}
                onSelect={setSelectedId}
                className={BOARD_SIZES[slot.boardSize] ?? BOARD_SIZES.wide}
              />
            ))}
          </div>
          <p className="px-2 pb-1 pt-3 text-xs text-fg-muted">Choose an open placement to see its details and build your quote.</p>
        </div>

        {inspectedSlot && (
          <Inspector
            slot={inspectedSlot}
            mode={mode}
            previewName={previewName}
            onPreviewChange={setPreviewName}
            onBuild={onBuild}
          />
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {slots.length} placements. Selected: {selectedSlot?.name}.
      </p>
    </>
  );
}

export function BannerBoard() {
  // GET /slots (shared with the quote builder, so only one request is made).
  const slotsQuery = useApiQuery('slots');

  return (
    <Section id="banner-board" tone={800} aria-labelledby="board-title">
      <SectionHeader
        eyebrow="Inventory"
        title="The banner board"
        accent="board"
        titleId="board-title"
        description="This is where brands appear on the website. Hover a slot to inspect it, select an open one to start a quote."
      />
      <QueryState query={slotsQuery} skeleton={<BoardSkeleton />} errorTitle="Couldn’t load the banner board.">
        {(slots) => <Board slots={slots} />}
      </QueryState>
    </Section>
  );
}
