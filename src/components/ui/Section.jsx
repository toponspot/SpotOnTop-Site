import { useInView } from '../../hooks/useInView';
import { cn } from '../../utils/cn';
import { Container } from './Container';

/** Sections alternate between two backgrounds: #262624 (900) and the main #1F1F1E (850 / 800). */
export const SECTION_TONES = {
  950: 'bg-ink-950',
  900: 'bg-section-a',
  850: 'bg-section-b',
  800: 'bg-section-b',
};

export function Section({ id, tone = 900, className, containerClassName, children, ...props }) {
  // Scroll reveal: opacity and transform only; the section keeps its height so nothing jumps.
  const [revealRef, visible] = useInView({ threshold: 0.04 });
  return (
    <section id={id} className={cn('relative py-16 sm:py-20 lg:py-24', SECTION_TONES[tone], className)} {...props}>
      <Container className={containerClassName}>
        <div ref={revealRef} className={cn('reveal', visible && 'is-visible')}>
          {children}
        </div>
      </Container>
    </section>
  );
}
