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
import { loadProducts, loadTopics, loadArticles, loadVideos, loadTraining } from '../utils/dataLoader';
import Breadcrumb from '../components/layout/Breadcrumb';
import Hero from '../components/common/Hero';
import TabNavigation from '../components/pages/TopicPage/TabNavigation';
import ArticlesGrid from '../components/pages/TopicPage/ArticlesGrid';
import VideosGrid from '../components/pages/TopicPage/VideosGrid';
import TrainingGrid from '../components/pages/TopicPage/TrainingGrid';
import type { ProductsData, TopicsData, ArticlesData, Video, Training } from '../types';

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

  // Determine which topic we're viewing for loading videos/training
  const currentTopicId = subtopicId || topicId;

  // Load videos data
  const {
    data: videosData,
    loading: videosLoading,
    error: videosError,
  } = useData<Video[]>(
    () => productId && currentTopicId ? loadVideos(region, productId, currentTopicId) : Promise.resolve([]),
    [region, productId, currentTopicId]
  );

  // Load training data
  const {
    data: trainingData,
    loading: trainingLoading,
    error: trainingError,
  } = useData<Training[]>(
    () => productId && currentTopicId ? loadTraining(region, productId, currentTopicId) : Promise.resolve([]),
    [region, productId, currentTopicId]
  );

  const loading = regionLoading || productsLoading || topicsLoading || articlesLoading || videosLoading || trainingLoading;
  const error = regionError || productsError || topicsError || articlesError || videosError || trainingError;

  // Find the current product and topics (before early returns to maintain hook order)
  const product = productsData?.products.find((p) => p.id === productId);

  // Find parent and current topic details
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
          <TrainingGrid training={trainingData || []} />
        )}

        {activeTab === 'videos' && (
          <VideosGrid videos={videosData || []} />
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
