/**
 * HomePage - Main landing page for the Help Centre
 *
 * Features:
 * - Hero section with welcome message
 * - Persona tabs (Customer, Accountant/Bookkeeper)
 * - Product grid filtered by persona
 * - Hot topics section
 * - Quick access cards
 */

import { useRegion } from '../hooks/useRegion';
import { useData } from '../hooks/useData';
import { usePageTitle } from '../hooks/usePageTitle';
import { loadProducts } from '../utils/dataLoader';
import Hero from '../components/common/Hero';
import PersonaTabs from '../components/pages/HomePage/PersonaTabs';
import ProductGrid from '../components/pages/HomePage/ProductGrid';
import HotTopics from '../components/pages/HomePage/HotTopics';
import QuickAccessCards from '../components/pages/HomePage/QuickAccessCards';
import type { ProductsData } from '../types';

export default function HomePage() {
  const { region, regionConfig, loading: regionLoading, error: regionError } = useRegion();

  // Set page title
  usePageTitle('Home');

  // Load products data for this region
  const {
    data: productsData,
    loading: dataLoading,
    error: dataError,
  } = useData<ProductsData>(() => loadProducts(region), [region]);

  const loading = regionLoading || dataLoading;
  const error = regionError || dataError;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Hero
        title="Welcome to the Help Centre"
        subtitle={`Find help and support for all our products in ${regionConfig?.displayName || 'your region'}`}
      />

      {/* Main Content */}
      <div className="container-custom py-12">
        {/* Persona Tabs */}
        <PersonaTabs />

        {/* Product Grid */}
        {productsData && (
          <ProductGrid products={productsData.products} />
        )}

        {/* Hot Topics */}
        {productsData && productsData.hotTopics && (
          <HotTopics hotTopics={productsData.hotTopics} />
        )}

        {/* Quick Access Cards */}
        {productsData && productsData.quickAccessCards && (
          <QuickAccessCards cards={productsData.quickAccessCards} />
        )}
      </div>
    </div>
  );
}
