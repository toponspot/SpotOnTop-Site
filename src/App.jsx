import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { ScrollManager } from './components/layout/ScrollManager';
import { AppProviders } from './context/AppProviders';
import { HomePage } from './pages/HomePage';
import { SECTION_IDS } from './utils/scroll';

/**
 * "/" and "/:section" both render the same landing page. Because they are one route,
 * moving between /pricing and /faq does not remount the page: only the scroll changes.
 */
function LandingRoute() {
  const { section } = useParams();
  if (section && !SECTION_IDS.includes(section)) return <Navigate to="/" replace />;
  return <HomePage />;
}

export default function App() {
  return (
    <AppProviders>
      <ScrollManager />
      <a
        href="#main"
        className="sr-only z-[100] bg-gold px-4 py-2 font-bold text-navy focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Routes>
          <Route path="/:section?" element={<LandingRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </AppProviders>
  );
}