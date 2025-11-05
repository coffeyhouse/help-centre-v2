/**
 * App - Main application component
 *
 * Sets up:
 * - React Router with region-based routing
 * - Context providers (Region, Persona)
 * - Route definitions for all pages
 * - Layout structure
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RegionProvider } from './context/RegionContext';
import { PersonaProvider } from './context/PersonaContext';

// Layout imports
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import Layout from './components/layout/Layout';

// Page imports
import HomePage from './pages/HomePage';
import ProductLanding from './pages/ProductLanding';
import TopicPage from './pages/TopicPage';
import ContactPage from './pages/ContactPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ReleaseNotesPage from './pages/ReleaseNotesPage';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RegionProvider>
        <PersonaProvider>
          <div className="min-h-screen flex flex-col">
            {/* Header with navigation and region selector */}
            <Header />

            {/* Main content area with Layout (includes BannerManager) */}
            <main className="flex-grow">
              <Routes>
                {/* Root redirects to default region (GB) */}
                <Route path="/" element={<Navigate to="/gb" replace />} />

                {/* Region-based routes with Layout wrapper */}
                <Route element={<Layout />}>
                  <Route path="/:region" element={<HomePage />} />
                  <Route path="/:region/search" element={<SearchResultsPage />} />
                  <Route path="/:region/products/:productId" element={<ProductLanding />} />
                  <Route path="/:region/products/:productId/release-notes" element={<ReleaseNotesPage />} />
                  <Route path="/:region/products/:productId/topics/:topicId" element={<TopicPage />} />
                  <Route path="/:region/products/:productId/topics/:topicId/:subtopicId" element={<TopicPage />} />
                  <Route path="/:region/contact" element={<ContactPage />} />
                </Route>

                {/* 404 - Redirect to default region */}
                <Route path="*" element={<Navigate to="/gb" replace />} />
              </Routes>
            </main>

            {/* Footer with links and information */}
            <Footer />
          </div>
        </PersonaProvider>
      </RegionProvider>
    </BrowserRouter>
  );
}

export default App;
