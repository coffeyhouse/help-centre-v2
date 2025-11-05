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

export default function TopicPage() {
  const { productId, topicId } = useParams<{ productId: string; topicId: string }>();
  const { region, regionConfig, loading, error } = useRegion();

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
      <div className="bg-black text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {topicId ? topicId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Topic'}
          </h1>
          <p className="text-lg text-gray-300">
            Find articles and guides for this topic
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">TopicPage - Placeholder</h2>
          <p className="text-gray-600 mb-4">
            This is a placeholder for the TopicPage component.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Current Region:</strong> {region}</p>
            <p><strong>Region Display Name:</strong> {regionConfig?.displayName}</p>
            <p><strong>Product ID:</strong> {productId}</p>
            <p><strong>Topic ID:</strong> {topicId}</p>
            <p><strong>URL Path:</strong> /{region}/products/{productId}/topics/{topicId}</p>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-900">
              <strong>Phase 4:</strong> Routing is now working! This page will be implemented in Phase 9 with:
            </p>
            <ul className="list-disc list-inside text-sm text-blue-800 mt-2">
              <li>Breadcrumb navigation (Product → Support hubs → Topic)</li>
              <li>Tab navigation (Support guides, Free training, Get in touch)</li>
              <li>Article grid (filtered by topic)</li>
              <li>Search functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
