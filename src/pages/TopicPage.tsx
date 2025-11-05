/**
 * TopicPage - Topic/Support Hub detail page
 *
 * Features:
 * - Breadcrumb navigation (Product > Support hubs > Topic)
 * - Hero section with search
 * - Tab navigation (Support guides, Free training, Get in touch)
 * - Article grid (filtered by topic)
 */

import { useParams } from 'react-router-dom';
import { useRegion } from '../hooks/useRegion';
import { useData } from '../hooks/useData';
import { loadProducts, loadTopics, loadArticles } from '../utils/dataLoader';
import Breadcrumb from '../components/layout/Breadcrumb';
import Hero from '../components/common/Hero';
import TabNavigation from '../components/pages/TopicPage/TabNavigation';
import ArticlesGrid from '../components/pages/TopicPage/ArticlesGrid';
import type { ProductsData, TopicsData, ArticlesData } from '../types';

export default function TopicPage() {
  const { productId, topicId, subtopicId } = useParams<{
    productId: string;
    topicId: string;
    subtopicId?: string;
  }>();
  const { region, loading: regionLoading, error: regionError } = useRegion();

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

  // Find the current product and topics
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
        <TabNavigation />

        {/* Articles/Subtopics Grid */}
        {currentTopicId && (
          <ArticlesGrid
            items={items}
            topicsData={topicsData}
            topicId={topicId}
            region={region}
            productId={productId}
          />
        )}
      </div>
    </div>
  );
}
