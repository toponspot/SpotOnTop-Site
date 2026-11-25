import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SECTION_IDS, pathForSection, prefersReducedMotion, scrollToElement, sectionFromPath } from '../../utils/scroll';

/** How long after a navigation the page may still change shape (sections loading, data arriving). */
const SETTLE_MS = 3000;

/**
 * Scrolls to the section named by the URL whenever the URL changes:
 *  - opening /pricing directly (first load);
 *  - clicking a <Link to="/pricing">, or calling goToSection('pricing');
 *  - the browser's back and forward buttons.
 * Renders nothing. Old #pricing links are redirected to /pricing.
 *
 * Lazy sections and data load in while we scroll, which changes the page height. So after
 * scrolling we keep the target aligned for SETTLE_MS, and stop at once if the visitor
 * scrolls, touches or presses a key.
 */
export function ScrollManager() {
    const location = useLocation();
    const navigate = useNavigate();

    // We scroll ourselves, so stop the browser restoring its own scroll position on back/forward.
    useEffect(() => {
        const previous = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
        return () => {
            window.history.scrollRestoration = previous;
        };
    }, []);

    useEffect(() => {
        // Old links like /#pricing → /pricing. Other hashes (e.g. the skip link's #main) are left alone.
        if (location.hash) {
            let hashId = '';
            try {
                hashId = decodeURIComponent(location.hash.slice(1));
            } catch {
                /* malformed hash: ignore */
            }
            if (SECTION_IDS.includes(hashId)) {
                navigate(pathForSection(hashId), { replace: true, state: { instant: true } });
            }
            return undefined;
        }

        const id = sectionFromPath(location.pathname);
        const initial = location.key === 'default' || Boolean(location.state?.instant);

        if (!id) {
            if (!initial) window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            return undefined;
        }

        // First load jumps straight there; in-app navigation scrolls smoothly.
        const behavior = initial ? 'instant' : 'smooth';
        scrollToElement(id, behavior);

        // Re-align whenever the page height changes while it settles. (Aligned already = no movement.)
        let firstNotice = true; // an observer reports once as soon as it starts watching
        const observer = new ResizeObserver(() => {
            if (firstNotice) {
                firstNotice = false;
                return;
            }
            scrollToElement(id, behavior);
        });
        observer.observe(document.body);

        const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
        const stop = () => {
            observer.disconnect();
            window.clearTimeout(giveUp);
            window.clearTimeout(listen);
            inputs.forEach((name) => window.removeEventListener(name, stop));
        };
        const giveUp = window.setTimeout(stop, SETTLE_MS);
        // Wait a moment before listening, so the click or key press that caused this navigation does not cancel it.
        const listen = window.setTimeout(() => {
            inputs.forEach((name) => window.addEventListener(name, stop, { once: true, passive: true }));
        }, 150);

        return stop;
    }, [location, navigate]);

    return null;
}