/**
 * TopicPage - Topic/Support Hub detail page
 *
 * Features:
 * - Breadcrumb navigation (Product > Support hubs > Topic)
 * - Hero section with search
 * - Tab navigation (Support guides, Free training, Get in touch)
 * - Article grid (filtered by topic)
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRegion } from '../hooks/useRegion';
import { useData } from '../hooks/useData';
import { usePageTitle } from '../hooks/usePageTitle';
import { loadProducts, loadTopics, loadArticles } from '../utils/dataLoader';
import Breadcrumb from '../components/layout/Breadcrumb';
import Hero from '../components/common/Hero';
import TabNavigation from '../components/pages/TopicPage/TabNavigation';
import ArticlesGrid from '../components/pages/TopicPage/ArticlesGrid';
import type { ProductsData, TopicsData, ArticlesData } from '../types';

export default function TopicPage() {
  const { productId, topicId, subtopicId } = useParams<{
    productId?: string;
    topicId?: string;
    subtopicId?: string;
  }>();
  const { region, loading: regionLoading, error: regionError } = useRegion();
  const [activeTab, setActiveTab] = useState('support-guides');

  // Load products data to get product name
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useData<ProductsData>(() => loadProducts(region), [region]);

  // Load topics data to get topic details
  const {
    data: topicsData,
    loading: topicsLoading,
    error: topicsError,
  } = useData<TopicsData>(() => loadTopics(region), [region]);

  // Load articles data
  const {
    data: articlesData,
    loading: articlesLoading,
    error: articlesError,
  } = useData<ArticlesData>(() => loadArticles(region), [region]);

  const loading = regionLoading || productsLoading || topicsLoading || articlesLoading;
  const error = regionError || productsError || topicsError || articlesError;

  // Find the current product and topics (before early returns to maintain hook order)
  const product = productsData?.products.find((p) => p.id === productId);

  // Determine which topic we're viewing (parent or subtopic)
  const currentTopicId = subtopicId || topicId;
  const parentTopic = topicsData?.supportHubs.find((t) => t.id === topicId && t.productId === productId);
  const currentTopic = subtopicId
    ? topicsData?.supportHubs.find((t) => t.id === subtopicId && t.productId === productId)
    : parentTopic;

  // Get names for display with fallbacks
  const productName = product?.name || productId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Product';
  const topicName = currentTopic?.title || currentTopicId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Topic';

  // Set page title (must be before any early returns to maintain hook order)
  usePageTitle(topicName, productName);

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
          <p className="text-lg font-semibold text-gray-900">Content Not Available</p>
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

  // Get all items (articles and subtopics) for the current topic
  const items = articlesData?.articles[productId || '']?.[currentTopicId || ''] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Hero
        title={topicName}
        subtitle={currentTopic?.description || 'Find articles and guides for this topic'}
        searchBar={true}
        searchPlaceholder="Search for answers..."
        productId={productId}
      />

      {/* Main Content */}
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: productName, path: `/${region}/products/${productId}` },
            { label: 'Support hubs', path: `/${region}/products/${productId}` },
            ...(subtopicId && parentTopic
              ? [
                  {
                    label: parentTopic.title,
                    path: `/${region}/products/${productId}/topics/${topicId}`,
                  },
                  { label: topicName, current: true },
                ]
              : [{ label: topicName, current: true }]),
          ]}
        />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'support-guides' && currentTopicId && (
          <ArticlesGrid
            items={items}
            topicsData={topicsData}
            topicId={topicId!}
            region={region}
            productId={productId}
          />
        )}

        {activeTab === 'free-training' && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Training Coming Soon</h3>
              <p className="text-gray-600">
                We're working on bringing you valuable training content. Check back soon for helpful tutorials and guides.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Videos Will Be Here Before You Know It</h3>
              <p className="text-gray-600">
                Video tutorials and walkthroughs are on their way. Stay tuned for visual guides to help you get the most out of our products.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'get-in-touch' && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Options Will Be Here Before You Know It</h3>
              <p className="text-gray-600">
                We're setting up various ways for you to get in touch with our support team. This section will be available soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
