/**
 * HomePage - Main landing page for the Help Centre
 *
 * Features:
 * - Hero section with personalized welcome message
 * - Your products section (for logged-in users)
 * - Products organized by category
 * - Quick access cards
 */

import { useState } from 'react';
import { useRegion } from '../hooks/useRegion';
import { useData } from '../hooks/useData';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../hooks/useAuth';
import { loadProducts } from '../utils/dataLoader';
import Hero from '../components/common/Hero';
import CategoryProductGrid from '../components/pages/HomePage/CategoryProductGrid';
import MyProductsGrid from '../components/pages/HomePage/MyProductsGrid';
import QuickAccessCards from '../components/pages/HomePage/QuickAccessCards';
import type { ProductsData } from '../types';

export default function HomePage() {
  const { region, regionConfig, loading: regionLoading, error: regionError } = useRegion();
  const { user } = useAuth();
  const [showAllProducts, setShowAllProducts] = useState(false);

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

  // Check if user has any products in the current region
  const userHasProductsInRegion = user && productsData
    ? productsData.products.some(product => user.ownedProducts.includes(product.id))
    : false;

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

  // Personalized greeting for logged-in users
  const heroTitle = user
    ? `Hi, ${user.name.split(' ')[0]}, how can we help you?`
    : 'Welcome to the Help Centre';

  const heroSubtitle = user
    ? `Find help and support for your products`
    : `Find help and support for all our products in ${regionConfig?.displayName || 'your region'}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Hero
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      {/* Main Content */}
      <div className="container-custom py-12">
        {/* Your Products Section - Only shown when logged in and has products */}
        {user && productsData && userHasProductsInRegion && (
          <MyProductsGrid
            products={productsData.products}
            showAllProducts={showAllProducts}
            onToggleShowAll={() => setShowAllProducts(!showAllProducts)}
          />
        )}

        {/* Products by Category - Show if: not logged in, OR user has no products in region, OR "Show all products" is clicked */}
        {productsData && (!user || !userHasProductsInRegion || showAllProducts) && (
          <CategoryProductGrid products={productsData.products} />
        )}
      </div>

      {/* Resources Section - Full width with darker background */}
      {productsData && productsData.quickAccessCards && productsData.quickAccessCards.length > 0 && (
        <div className="bg-gray-100 py-12">
          <div className="container-custom">
            <QuickAccessCards cards={productsData.quickAccessCards} />
          </div>
        </div>
      )}
    </div>
  );
}
