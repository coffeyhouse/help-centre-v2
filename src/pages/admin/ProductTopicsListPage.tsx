import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  PlusIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  AcademicCapIcon,
  PhoneIcon,
  PencilIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import AddTopicModal from '../../components/admin/AddTopicModal';
import Icon from '../../components/common/Icon';

interface Product {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  productId: string;
  parentTopicId?: string;
  showOnProductLanding?: boolean;
}

export default function ProductTopicsListPage() {
  const { region, productId } = useParams<{ region: string; productId: string }>();
  const { token } = useAdminAuth();
  const { regions } = useAdminRegion();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [articleCounts, setArticleCounts] = useState<Record<string, number>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  usePageTitle('Topics', 'Admin');

  const currentRegion = regions.find((r) => r.id === region);
  const regionName = currentRegion?.name || region;

  useEffect(() => {
    loadData();
  }, [region, productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load product details
      const productResponse = await fetch(`/api/products/${region}/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!productResponse.ok) {
        throw new Error('Failed to load product');
      }

      const productResult = await productResponse.json();
      setProduct(productResult.product);

      // Load topics
      const topicsResponse = await fetch(`/api/products/${region}/${productId}/topics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!topicsResponse.ok) {
        throw new Error('Failed to load topics');
      }

      const topicsResult = await topicsResponse.json();
      setTopics(topicsResult.data.supportHubs || []);

      // Load articles for article counts
      const articlesResponse = await fetch(`/api/products/${region}/${productId}/articles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (articlesResponse.ok) {
        const articlesResult = await articlesResponse.json();
        const counts: Record<string, number> = {};
        const articlesByProduct = articlesResult.data.articles || {};
        const productArticles = articlesByProduct[productResult.product.id] || {};

        Object.keys(productArticles).forEach((topicId) => {
          counts[topicId] = productArticles[topicId].length || 0;
        });

        setArticleCounts(counts);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading topics:', err);
    } finally {
      setLoading(false);
      setHasUnsavedChanges(false);
    }
  };

  const handleSaveTopics = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch(`/api/products/${region}/${productId}/topics`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { supportHubs: topics } }),
      });

      if (!response.ok) {
        throw new Error('Failed to save topics');
      }

      setSuccessMessage('Changes saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadData(); // Reload to get updated data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      console.error('Error saving topics:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTopicCreated = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    loadData();
  };

  const handleEditClick = () => {
    if (selectedTopic) {
      setIsEditModalOpen(true);
    }
  };

  const handleManageArticles = () => {
    if (selectedTopic) {
      navigate(`/admin/${region}/products/${productId}/topics/${selectedTopic.id}/articles`);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null) return;

    const newTopics = [...topics];
    const [draggedTopic] = newTopics.splice(draggedIndex, 1);
    newTopics.splice(dropIndex, 0, draggedTopic);

    setTopics(newTopics);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setHasUnsavedChanges(true);

    // Update selected topic if it was moved
    if (selectedTopic && draggedTopic.id === selectedTopic.id) {
      setSelectedTopic(draggedTopic);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveOrder = async () => {
    await handleSaveTopics();
    setHasUnsavedChanges(false);
  };

  return (
    <AdminLayout
      breadcrumbs={[
        { label: regionName || '', path: `/admin/${region}/menu` },
        { label: 'Products', path: `/admin/${region}/products` },
        { label: product?.name || productId || '', path: `/admin/${region}/products/${productId}` },
        { label: 'Topics' },
      ]}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Topics for {product?.name}</h1>
          <p className="text-gray-600">
            Select a topic to manage its content and settings. Drag to reorder.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Order'}
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Topic
          </button>
        </div>
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
          <p className="mt-4 text-gray-600">Loading topics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Topics List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All Topics ({topics.length})
            </h2>
            {topics.length > 0 ? (
              <div className="space-y-2">
                {topics.map((topic, index) => (
                  <button
                    key={topic.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedTopic(topic)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-move ${
                      draggedIndex === index
                        ? 'opacity-50'
                        : dragOverIndex === index
                        ? 'border-blue-500 bg-blue-50'
                        : selectedTopic?.id === topic.id
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        selectedTopic?.id === topic.id ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {topic.icon ? (
                          <Icon name={topic.icon} className={`w-6 h-6 ${
                            selectedTopic?.id === topic.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        ) : (
                          <DocumentTextIcon className={`w-6 h-6 ${
                            selectedTopic?.id === topic.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className={`font-semibold text-sm ${
                            selectedTopic?.id === topic.id ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {topic.title}
                          </h3>
                          <ChevronRightIcon className={`w-5 h-5 flex-shrink-0 ml-2 ${
                            selectedTopic?.id === topic.id ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{topic.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {articleCounts[topic.id] !== undefined && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                              {articleCounts[topic.id]} articles
                            </span>
                          )}
                          {topic.parentTopicId && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              Subtopic
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No topics found for this product.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Create Your First Topic
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Topic Management */}
          <div>
            {selectedTopic ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <div className="mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      {selectedTopic.icon ? (
                        <Icon name={selectedTopic.icon} className="w-8 h-8 text-blue-600" />
                      ) : (
                        <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {selectedTopic.title}
                      </h3>
                      <p className="text-sm text-gray-600">{selectedTopic.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleEditClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit Topic Details
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Manage Content</h4>
                  <div className="space-y-3">
                    {/* Articles */}
                    <button
                      onClick={handleManageArticles}
                      className="w-full group bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">Articles</div>
                            <div className="text-xs text-gray-500">
                              {articleCounts[selectedTopic.id] || 0} articles
                            </div>
                          </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </button>

                    {/* Videos (Placeholder) */}
                    <div className="relative">
                      <button
                        disabled
                        className="w-full bg-white p-4 rounded-lg border-2 border-gray-200 text-left opacity-50 cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <PlayCircleIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-sm text-gray-900">Videos</div>
                              <div className="text-xs text-gray-500">Coming soon</div>
                            </div>
                          </div>
                        </div>
                      </button>
                      <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                        Soon
                      </span>
                    </div>

                    {/* Training (Placeholder) */}
                    <div className="relative">
                      <button
                        disabled
                        className="w-full bg-white p-4 rounded-lg border-2 border-gray-200 text-left opacity-50 cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-sm text-gray-900">Training</div>
                              <div className="text-xs text-gray-500">Coming soon</div>
                            </div>
                          </div>
                        </div>
                      </button>
                      <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                        Soon
                      </span>
                    </div>

                    {/* Contact Options (Placeholder) */}
                    <div className="relative">
                      <button
                        disabled
                        className="w-full bg-white p-4 rounded-lg border-2 border-gray-200 text-left opacity-50 cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <PhoneIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-sm text-gray-900">Contact Options</div>
                              <div className="text-xs text-gray-500">Coming soon</div>
                            </div>
                          </div>
                        </div>
                      </button>
                      <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                        Soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center h-full flex items-center justify-center">
                <div>
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Select a topic to manage its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleTopicCreated}
        productId={product?.id || ''}
        availableParentTopics={topics}
      />

      {/* Edit Topic Modal */}
      <AddTopicModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleTopicCreated}
        productId={product?.id || ''}
        existingTopic={selectedTopic}
        availableParentTopics={topics}
      />
    </AdminLayout>
  );
}
