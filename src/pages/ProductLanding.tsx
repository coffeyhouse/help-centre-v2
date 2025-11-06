/**
 * ProductLanding - Product-specific help page
 *
 * Features:
 * - Product breadcrumb navigation
 * - Top navigation bar
 * - Hero section with search
 * - Support hubs grid (filtered by product)
 * - "View all support hubs" button
 */

import { useParams } from 'react-router-dom';
import { useRegion } from '../hooks/useRegion';
import { useData } from '../hooks/useData';
import { usePageTitle } from '../hooks/usePageTitle';
import { loadProducts, loadTopics } from '../utils/dataLoader';
import TopNavigation from '../components/pages/ProductLanding/TopNavigation';
import Hero from '../components/common/Hero';
import SupportHubsGrid from '../components/pages/ProductLanding/SupportHubsGrid';
import type { ProductsData, TopicsData } from '../types';

export default function ProductLanding() {
  const { productId } = useParams<{ productId: string }>();
  const { region, loading: regionLoading, error: regionError } = useRegion();

  // Load products data to get product name
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useData<ProductsData>(() => loadProducts(region), [region]);

  // Load topics/support hubs data
  const {
    data: topicsData,
    loading: topicsLoading,
    error: topicsError,
  } = useData<TopicsData>(() => loadTopics(region), [region]);

  const loading = regionLoading || productsLoading || topicsLoading;
  const error = regionError || productsError || topicsError;

  // Find the current product (before early returns to maintain hook order)
  const product = productsData?.products.find((p) => p.id === productId);

  // Get product name for display
  const productName = product?.name || productId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Product';

  // Set page title (must be before any early returns to maintain hook order)
  usePageTitle(productName);

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

  // Check if product is available for the current country
  const isProductAvailable = product && (!product.countries || product.countries.includes(region));

  // Show error if product is not available in this country
  if (!isProductAvailable) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Product Not Available</p>
          <p className="text-gray-600 mt-2">
            {productName} is not available in your selected region.
          </p>
          <p className="text-gray-500 mt-4">
            Please select a different region or choose another product.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <TopNavigation productId={productId} />

      {/* Hero Section */}
      <Hero
        title={`${productName} Help`}
        subtitle="You need help. We have answers."
        searchBar={true}
        searchPlaceholder="Search for answers..."
        productId={productId}
        knowledgebaseCollection={product?.knowledgebase_collection}
      />

      {/* Main Content */}
      <div className="container-custom py-8">
        {/* Support Hubs Grid */}
        {topicsData && productId && (
          <SupportHubsGrid
            supportHubs={topicsData.supportHubs}
            productId={productId}
          />
        )}
      </div>
    </div>
  );
}
