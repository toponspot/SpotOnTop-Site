import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FOOTER_LINKS } from '../../config/navigation';
import { API_CONFIG } from '../../config/api.config';
import { useGoToSection } from '../../hooks/useGoToSection';
import { pathForSection } from '../../utils/scroll';
import { Container } from '../ui/Container';
import { Logo } from '../ui/Logo';

export function Footer() {
  const goToSection = useGoToSection();
  return (
    <footer className="bg-ink-950 pb-[env(safe-area-inset-bottom,0px)]">
      <Container className="pt-14 lg:pt-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <Logo />
            <p className="mt-5 text-[15px] leading-relaxed text-fg-muted">
              A billboard-style ad marketplace connecting brands with audiences across India and the USA.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-4 lg:flex lg:gap-x-8 lg:pt-2 xl:gap-x-12 2xl:gap-x-24">
              {FOOTER_LINKS.map((link) => (
                <li key={link.id}>
                  <Link
                    to={pathForSection(link.id)}
                    className="whitespace-nowrap text-[14px] font-semibold text-fg-muted underline decoration-transparent decoration-2 underline-offset-[6px] transition-colors hover:text-fg hover:decoration-gold"
                   
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-line py-6 text-[13px] text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Spot On Top · Be seen on top.</p>
          <button
            type="button"
            onClick={() => goToSection()}
            className="inline-flex items-center gap-1.5 self-start font-semibold transition-colors hover:text-fg sm:self-auto"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </Container>
    </footer>
  );
}
