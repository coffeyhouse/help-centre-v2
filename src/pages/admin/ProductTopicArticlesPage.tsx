import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import JSONEditor from '../../components/admin/editors/JSONEditor';

interface Product {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  title: string;
}

export default function ProductTopicArticlesPage() {
  const { region, productId, topicId } = useParams<{ region: string; productId: string; topicId: string }>();
  const { token } = useAdminAuth();
  const { regions } = useAdminRegion();
  const [data, setData] = useState<any>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const currentRegion = regions.find((r) => r.id === region);
  const regionName = currentRegion?.name || region;

  useEffect(() => {
    loadData();
  }, [region, productId, topicId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load product details
      const productResponse = await fetch(`/api/files/${region}-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!productResponse.ok) {
        throw new Error('Failed to load product');
      }

      const productResult = await productResponse.json();
      const foundProduct = productResult.data.products?.find((p: Product) => p.id === productId);

      if (!foundProduct) {
        throw new Error('Product not found');
      }

      setProduct(foundProduct);

      // Load topic details
      const topicsResponse = await fetch(`/api/files/${region}-topics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!topicsResponse.ok) {
        throw new Error('Failed to load topics');
      }

      const topicsResult = await topicsResponse.json();
      const foundTopic = topicsResult.data.supportHubs?.find((t: Topic) => t.id === topicId);

      if (!foundTopic) {
        throw new Error('Topic not found');
      }

      setTopic(foundTopic);

      // Load articles
      const articlesResponse = await fetch(`/api/files/${region}-articles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!articlesResponse.ok) {
        throw new Error('Failed to load articles');
      }

      const articlesResult = await articlesResponse.json();
      setData(articlesResult.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch(`/api/files/${region}-articles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error('Failed to save articles');
      }

      setSuccessMessage('Changes saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      console.error('Error saving articles:', err);
    } finally {
      setSaving(false);
    }
  };

  const articleCount = data?.articles?.[productId]?.[topicId]?.length || 0;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: regionName || '', path: `/admin/${region}/menu` },
        { label: 'Products', path: `/admin/${region}/products` },
        { label: product?.name || productId || '', path: `/admin/${region}/products/${productId}` },
        { label: 'Topics', path: `/admin/${region}/products/${productId}/topics` },
        { label: topic?.title || topicId || '', path: `/admin/${region}/products/${productId}/topics` },
        { label: 'Articles' },
      ]}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Articles for {topic?.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {articleCount} {articleCount === 1 ? 'article' : 'articles'}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <p className="text-gray-600">
          Manage articles for this topic. Articles are displayed in the order they appear in the array.
        </p>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      ) : data ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            <strong>Note:</strong> Currently using JSON editor. Navigate to{' '}
            <code className="bg-blue-100 px-1 py-0.5 rounded">
              articles &gt; {productId} &gt; {topicId}
            </code>{' '}
            to edit articles for this topic.
          </div>
          <JSONEditor data={data} onChange={setData} />
        </div>
      ) : null}
    </AdminLayout>
  );
}
