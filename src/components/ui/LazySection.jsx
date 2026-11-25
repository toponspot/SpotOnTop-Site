import { Component, Suspense, forwardRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useInView } from '../../hooks/useInView';
import { cn } from '../../utils/cn';
import { SECTION_IDS, sectionFromPath } from '../../utils/scroll';
import { ErrorState } from './AsyncState';

/** Same backgrounds as <Section>, so the placeholder and the real section look alike. */
const TONES = { 800: 'bg-section-b', 850: 'bg-section-b', 900: 'bg-section-a' };

/** Start loading a section this far before it scrolls into view. */
const LOOKAHEAD = '400px 0px';

/**
 * Empty block that holds the section's place (and its #id, so links and the
 * scroll spy keep working) while the code is not loaded yet. `className` gives it
 * the section's approximate height so the page does not jump when the real one arrives.
 */
const Placeholder = forwardRef(function Placeholder({ id, tone, className, children }, ref) {
    return (
        <div ref={ref} id={id} aria-hidden={children ? undefined : 'true'} className={cn(TONES[tone], className)}>
            {children}
        </div>
    );
});

/** Catches a failed code download (offline, or a new deploy replaced the file) instead of blanking the page. */
class ChunkBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;
        const { id, tone, className } = this.props;
        return (
            <Placeholder id={id} tone={tone} className={cn('flex items-center justify-center px-5', className)}>
                <ErrorState
                    error={error}
                    onRetry={() => window.location.reload()}
                    title="Couldn’t load this section."
                    className="w-full max-w-xl"
                />
            </Placeholder>
        );
    }
}

/**
 * Loads a section's code (a React.lazy component) shortly before it scrolls into view.
 *
 *   <LazySection id="pricing" tone={800} placeholderClassName="min-h-[890px]">
 *     <Pricing />
 *   </LazySection>
 *
 * It loads when ANY of these is true, and stays loaded afterwards:
 *  - the placeholder is within LOOKAHEAD of the viewport (IntersectionObserver);
 *  - the URL points at this section or one below it (/faq): everything above the target is
 *    loaded too, so the page has its real height and the scroll lands in the right place.
 * `id` must equal the id the real section renders, and must be one of SECTION_IDS.
 */
export function LazySection({ id, tone = 900, placeholderClassName, children }) {
    const { pathname } = useLocation();
    const [ref, inView] = useInView({ threshold: 0, rootMargin: LOOKAHEAD });

    const targetIndex = SECTION_IDS.indexOf(sectionFromPath(pathname));
    const linkedTo = targetIndex >= 0 && SECTION_IDS.indexOf(id) <= targetIndex;
    const wanted = inView || linkedTo;

    // Once wanted, always loaded (navigating back to "/" must not unmount it).
    const [loaded, setLoaded] = useState(wanted);
    if (wanted && !loaded) setLoaded(true);

    if (!loaded) return <Placeholder ref={ref} id={id} tone={tone} className={placeholderClassName} />;

    return (
        <ChunkBoundary id={id} tone={tone} className={placeholderClassName}>
            <Suspense fallback={<Placeholder id={id} tone={tone} className={placeholderClassName} />}>{children}</Suspense>
        </ChunkBoundary>
    );
}