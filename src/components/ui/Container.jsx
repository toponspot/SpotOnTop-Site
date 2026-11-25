import { cn } from '../../utils/cn';

/** Page gutter: 1600px content width on a 1920 canvas, as in the design. */
export function Container({ as: Component = 'div', className, children, ...props }) {
  return (
    <Component className={cn('mx-auto w-full max-w-[1696px] px-6 sm:px-8 lg:px-12', className)} {...props}>
      {children}
    </Component>
  );
}
