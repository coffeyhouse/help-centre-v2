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
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminRegionProvider } from './context/AdminRegionContext';

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
import ProfilePage from './pages/ProfilePage';
import CountrySelector from './pages/CountrySelector';

// Admin imports
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import EditorPage from './pages/admin/EditorPage';
import RegionSelectorPage from './pages/admin/RegionSelectorPage';
import MainMenuPage from './pages/admin/MainMenuPage';
import IncidentsPage from './pages/admin/IncidentsPage';
import PopupsPage from './pages/admin/PopupsPage';
import ContactOptionsPage from './pages/admin/ContactOptionsPage';
import ReleaseNotesManagementPage from './pages/admin/ReleaseNotesManagementPage';
import RegionSettingsPage from './pages/admin/RegionSettingsPage';
import ProductsListPage from './pages/admin/ProductsListPage';
import ProductDetailPage from './pages/admin/ProductDetailPage';
import ProductTopicsListPage from './pages/admin/ProductTopicsListPage';
import ProductTopicArticlesPage from './pages/admin/ProductTopicArticlesPage';
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AdminAuthProvider>
        <AdminRegionProvider>
          <Routes>
            {/* Admin routes - Login (no auth required) */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Admin routes - Protected */}
            <Route path="/admin" element={<Navigate to="/admin/regions" replace />} />
            <Route
              path="/admin/regions"
              element={
                <ProtectedRoute>
                  <RegionSelectorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/:region/menu"
              element={
                <ProtectedRoute>
                  <MainMenuPage />
                </ProtectedRoute>
              }
            />

            {/* Region-level content pages */}
            <Route
              path="/admin/:region/incidents"
              element={
                <ProtectedRoute>
                  <IncidentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/:region/popups"
              element={
                <ProtectedRoute>
                  <PopupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/:region/contact"
              element={
                <ProtectedRoute>
                  <ContactOptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/:region/release-notes"
              element={
                <ProtectedRoute>
                  <ReleaseNotesManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/:region/settings"
              element={
                <ProtectedRoute>
                  <RegionSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Product-level pages */}
            <Route
              path="/admin/:region/products"
              element={
                <ProtectedRoute>
                  <ProductsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/:region/products/:productId"
              element={
                <ProtectedRoute>
                  <ProductDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/:region/products/:productId/topics"
              element={
                <ProtectedRoute>
                  <ProductTopicsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/:region/products/:productId/topics/:topicId/articles"
              element={
                <ProtectedRoute>
                  <ProductTopicArticlesPage />
                </ProtectedRoute>
              }
            />

            {/* Legacy admin routes (keep for backward compatibility) */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit/:fileId"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />

            {/* TODO: Add new admin routes as pages are created:
            - /admin/regions (RegionSelectorPage)
            - /admin/:region/menu (MainMenuPage)
            - /admin/:region/products (ProductsListPage)
            - /admin/:region/products/:productId (ProductDetailPage)
            - /admin/:region/products/:productId/topics (TopicsListPage)
            - /admin/:region/products/:productId/topics/:topicId (TopicDetailPage)
            - /admin/:region/products/:productId/topics/:topicId/articles (ArticlesEditorPage)
            - /admin/:region/incidents (IncidentsPage)
            - /admin/:region/popups (PopupsPage)
            - /admin/:region/contact (ContactOptionsPage)
            - /admin/:region/release-notes (ReleaseNotesPage)
            - /admin/:region/settings (RegionsManagementPage)
            */}

            {/* Country selector (no region context needed) */}
            <Route path="/select-country" element={<CountrySelector />} />

            {/* Public routes */}
          <Route
            path="/*"
            element={
              <RegionProvider>
                <PersonaProvider>
                  <AuthProvider>
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
                          <Route path="/:region/profile" element={<ProfilePage />} />
                        </Route>

                        {/* 404 - Redirect to default region */}
                        <Route path="*" element={<Navigate to="/gb" replace />} />
                      </Routes>
                    </main>

                      {/* Footer with links and information */}
                      <Footer />
                    </div>
                  </AuthProvider>
                </PersonaProvider>
              </RegionProvider>
            }
          />
        </Routes>
        </AdminRegionProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
