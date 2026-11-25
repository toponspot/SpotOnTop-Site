import { useEffect, useRef, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { useSettings } from '../../context/SettingsContext';
import { NAV_LINKS } from '../../config/navigation';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { cn } from '../../utils/cn';
import { CURRENCIES } from '../../utils/currency';
import { pathForSection } from '../../utils/scroll';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { Logo } from '../ui/Logo';

/** Every section in page order, so the spy knows where the reader is. */
const SECTION_ORDER = [
  'how-it-works',
  'spots',
  'live-traffic',
  'banner-board',
  'brands',
  'banner-panel',
  'community-pick',
  'pricing',
  'quote-builder',
  'faq',
  'join',
];

function CurrencyToggle({ className }) {
  const { currency, setCurrency } = useSettings();
  return (
    <div
      role="radiogroup"
      aria-label="Display currency"
      className={cn('inline-flex h-10 items-center gap-0.5 border border-line p-0.5', className)}
    >
      {CURRENCIES.map((option) => {
        const selected = option.value === currency;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setCurrency(option.value)}
            className={cn(
              'h-full px-2.5 text-[10px] font-extrabold tracking-[0.1em] transition-colors',
              selected ? 'bg-fg text-ink-950' : 'text-fg-muted hover:text-fg',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// Dark ⇄ light switch: the new theme grows as a circle from the toggle button (View Transitions API).
// Browsers without it, and visitors who prefer reduced motion, just get the instant switch.
const THEME_REVEAL_MS = 450;

function switchTheme(event, toggleTheme) {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof document.startViewTransition !== 'function' || reduced) {
    toggleTheme();
    return;
  }

  // The circle starts at the centre of the button (also when it is pressed with the keyboard).
  // The page is shown at 80% on desktop (html zoom), and that scale also applies to the lengths in the
  // clip-path below, so on-screen pixels are divided by it. On phones the zoom is 1 and nothing changes.
  const zoom = parseFloat(getComputedStyle(root).zoom) || 1;
  const rect = event.currentTarget.getBoundingClientRect(); // on-screen pixels
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const x = cx / zoom;
  const y = cy / zoom;
  // Far enough to reach the corner of the screen that is furthest from the button.
  const radius = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy)) / zoom;

  const transition = document.startViewTransition(() => {
    // The theme class is applied in an effect, so flush React synchronously before the "after" snapshot.
    flushSync(toggleTheme);
  });
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: THEME_REVEAL_MS, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => { });
}

function ThemeToggle() {
  const { theme, toggleTheme } = useSettings();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={(event) => switchTheme(event, toggleTheme)}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="inline-flex h-10 w-10 items-center justify-center text-fg-muted transition-colors hover:text-fg"
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />}
    </button>
  );
}

export function Navbar() {
  const activeId = useScrollSpy(SECTION_ORDER);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef(null);

  // One passive listener drives both the shrink (state, flips once) and the progress line
  // (written straight to the element, so scrolling never re-renders the page).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 16);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setMenuOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setMenuOpen(false);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const solid = scrolled || menuOpen;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top,0px)] transition-[background-color,border-color] duration-300',
        solid ? 'border-line bg-ink-950/80 backdrop-blur-xl' : 'border-transparent bg-ink-950/0',
      )}
    >
      <Container>
        <nav
          aria-label="Main"
          className={cn(
            'flex items-center justify-between gap-4 transition-[height] duration-300',
            scrolled ? 'h-14' : 'h-16 lg:h-[72px]',
          )}
        >
          <Link to="/" onClick={closeMenu} className="px-0.5 py-1" aria-label="Spot On Top, back to top">
            <Logo compact={scrolled} />
          </Link>

          <ul className="hidden items-center gap-1 xl:flex 2xl:gap-3">
            {NAV_LINKS.map((link) => {
              const active = activeId === link.id;
              return (
                <li key={link.id}>
                  <Link
                    to={pathForSection(link.id)}
                    aria-current={active ? 'location' : undefined}
                    className={cn(
                      'relative px-3 py-2 text-[13px] font-semibold transition-colors',
                      active ? 'text-fg' : 'text-fg-muted hover:text-fg',
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-x-3 -bottom-0.5 h-0.5 origin-left bg-gold transition-transform duration-300',
                        active ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <CurrencyToggle className="hidden sm:inline-flex" />
            <ThemeToggle />
            <Button as={Link} to={pathForSection('banner-board')} size="sm" className="hidden h-10 sm:inline-flex">
              Book a slot
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex h-10 w-10 items-center justify-center border border-line text-fg transition-colors hover:border-line-strong xl:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" /> : <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div
            id="mobile-menu"
            className="mb-3 max-h-[calc(100dvh-5rem)] animate-fade-in overflow-y-auto border border-line bg-ink-950 p-3 xl:hidden"
          >
            <ul className="grid gap-1 sm:grid-cols-2">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <Link
                    to={pathForSection(link.id)}
                    onClick={closeMenu}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 text-base font-semibold transition-colors',
                      activeId === link.id ? 'bg-ink-800 text-fg' : 'text-fg-muted hover:bg-ink-800/60 hover:text-fg',
                    )}
                  >
                    {link.label}
                    {activeId === link.id && <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 sm:hidden">
              <CurrencyToggle />
              <Button as={Link} to={pathForSection('banner-board')} onClick={closeMenu} className="h-10 flex-1">
                Book a slot
              </Button>
            </div>
          </div>
        )}
      </Container>

      {/* 2 px yellow reading-progress line along the bottom edge. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-transparent">
        <span ref={progressRef} className="block h-full origin-left scale-x-0 bg-gold" />
      </span>
    </header>
  );
}
