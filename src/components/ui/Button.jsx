import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

/*
  Buttons: square corners, caps, .14em tracking, dark text on the yellow gradient.
  Only transform-free colour transitions, so nothing shifts on hover.
*/
const VARIANTS = {
  primary:
    'bg-gold-gradient text-navy hover:brightness-[1.06] active:brightness-95',
  outline: 'border border-line-strong bg-transparent text-fg hover:border-fg-subtle hover:bg-ink-750/50',
  // Off-white button, used where it must differ from a yellow band (Join form).
  light: 'bg-[#F5F4EE] text-[#262624] hover:bg-white',
  ghost: 'text-fg-muted hover:bg-ink-750/60 hover:text-fg',
  subtle: 'border border-line bg-ink-800 text-fg hover:border-line-strong',
};

const SIZES = {
  xs: 'h-8 px-3 text-[10px]',
  sm: 'h-10 px-4 text-[11px]',
  md: 'h-12 px-5 text-[12px]',
  lg: 'h-[52px] px-6 text-[12.5px]',
  icon: 'h-11 w-11',
};

export const Button = forwardRef(function Button(
  { as: Component = 'button', variant = 'primary', size = 'md', className, type, children, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type ?? 'button' : undefined}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-extrabold uppercase tracking-caps transition-[background-color,border-color,color,filter] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
