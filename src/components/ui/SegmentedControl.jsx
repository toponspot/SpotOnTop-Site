import { useRef } from 'react';
import { cn } from '../../utils/cn';

const SELECTED = {
  gold: 'bg-gold-gradient text-navy border-transparent',
  light: 'bg-gold-gradient text-navy border-transparent',
  soft: 'bg-ink-750 text-fg border-transparent',
};

/**
 * Single-choice control used for filters, tabs and toggles.
 * `mode="tabs"` exposes tab semantics; otherwise it behaves as a radio group.
 * Arrow keys move the selection, as with native radio buttons.
 *
 * Look: the selected option is a yellow gradient with dark text; the others are outlined (#3D3D3A).
 * `stretch` joins the options into one full-width bar (used for two-way toggles and tab strips).
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  label,
  mode = 'radio',
  tone = 'gold',
  size = 'md',
  shape, // kept for the existing call sites; the design uses square corners everywhere
  stretch = false,
  idPrefix,
  className,
  itemClassName,
}) {
  const buttons = useRef([]);
  const isTabs = mode === 'tabs';

  const onKeyDown = (event, index) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const nextIndex = (index + keys[event.key] + options.length) % options.length;
    onChange(options[nextIndex].value);
    buttons.current[nextIndex]?.focus();
  };

  return (
    <div
      role={isTabs ? 'tablist' : 'radiogroup'}
      aria-label={label}
      data-shape={shape}
      className={cn(
        'flex items-center',
        stretch ? 'w-full border border-line bg-ink-900' : 'inline-flex max-w-full flex-wrap gap-1.5',
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            type="button"
            role={isTabs ? 'tab' : 'radio'}
            id={idPrefix ? `${idPrefix}-tab-${option.value}` : undefined}
            aria-controls={isTabs && idPrefix ? `${idPrefix}-panel` : undefined}
            aria-selected={isTabs ? selected : undefined}
            aria-checked={isTabs ? undefined : selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'inline-flex items-center justify-center gap-2 whitespace-nowrap border font-extrabold uppercase tracking-[0.1em] transition-colors duration-150',
              size === 'sm' ? 'h-8 px-3 text-[10px]' : 'h-9 px-4 text-[11px] sm:h-10 sm:px-5',
              stretch && 'flex-1',
              selected
                ? SELECTED[tone]
                : cn('text-fg-muted hover:text-fg', stretch ? 'border-transparent' : 'border-line hover:border-line-strong'),
              itemClassName,
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
