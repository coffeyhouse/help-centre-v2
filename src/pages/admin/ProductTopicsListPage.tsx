import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import {
  PlusIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  AcademicCapIcon,
  PhoneIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import AddTopicModal from '../../components/admin/AddTopicModal';
import DragDropCard, { type Badge } from '../../components/admin/DragDropCard';
import DragDropListLayout from '../../components/admin/DragDropListLayout';
import DetailPanel from '../../components/admin/DetailPanel';
import PageHeader, { type PageHeaderBadge } from '../../components/admin/PageHeader';

interface Product {
  id: string;
  name: string;
  description?: string;
  type?: 'cloud' | 'desktop';
  icon?: string;
  personas?: string[];
  categories?: string[];
  countries?: string[];
  knowledgebase_collection?: string;
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Drag and drop functionality
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop: handleDropRaw,
    handleDragEnd,
  } = useDragAndDrop(topics, (reorderedTopics) => {
    setTopics(reorderedTopics);
    setHasUnsavedChanges(true);
  });

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

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    handleDropRaw(e, dropIndex);

    // Update selected topic reference after reordering
    if (selectedTopic && draggedIndex !== null) {
      const movedTopic = topics[draggedIndex];
      if (movedTopic.id === selectedTopic.id) {
        // Selected topic was moved, update the reference
        setSelectedTopic(movedTopic);
      }
    }
  };

  const handleSaveOrder = async () => {
    await handleSaveTopics();
    setHasUnsavedChanges(false);
  };

  const getProductBadges = (): PageHeaderBadge[] => {
    if (!product) return [];

    const badges: PageHeaderBadge[] = [];

    // Type badge
    if (product.type) {
      badges.push({
        label: product.type === 'cloud' ? 'Cloud Product' : 'Desktop Product',
        color: product.type === 'cloud' ? 'blue' : 'gray',
      });
    }

    // Personas
    if (product.personas && product.personas.length > 0) {
      product.personas.forEach((persona) => {
        badges.push({ label: persona, color: 'purple' });
      });
    }

    // Categories
    if (product.categories && product.categories.length > 0) {
      const categoryLabels: Record<string, string> = {
        'accounting-software': 'Accounting software',
        'people-payroll': 'People and Payroll',
        'business-management': 'Business management',
        'solutions-accountants-bookkeepers': 'Solutions for accountants and bookkeepers',
      };
      product.categories.forEach((category) => {
        badges.push({
          label: categoryLabels[category] || category,
          color: 'indigo',
        });
      });
    }

    // Countries
    if (product.countries && product.countries.length > 0) {
      product.countries.forEach((country) => {
        badges.push({ label: country.toUpperCase(), color: 'green' });
      });
    }

    return badges;
  };

  return (
    <AdminLayout
      breadcrumbs={[
        { label: regionName || '' },
        { label: 'Products', path: `/admin/${region}/products` },
        { label: product?.name || productId || '' },
        { label: 'Topics' },
      ]}
    >
      {product && (
        <PageHeader
          icon={product.icon}
          iconFallback={product.name.charAt(0)}
          title={product.name}
          description={product.description}
          metadata={
            product.knowledgebase_collection
              ? [{ label: 'KB Collection', value: product.knowledgebase_collection }]
              : []
          }
          badges={getProductBadges()}
          onEdit={() => navigate(`/admin/${region}/products/${productId}`)}
          actions={
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
          }
        />
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Topics</h2>
        <p className="text-gray-600 text-sm">
          Select a topic to manage its content and settings. Drag to reorder.
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
          <p className="mt-4 text-gray-600">Loading topics...</p>
        </div>
      ) : (
        <DragDropListLayout
          listTitle="All Topics"
          itemCount={topics.length}
          listContent={topics.map((topic, index) => {
            const badges: Badge[] = [];

            if (articleCounts[topic.id] !== undefined) {
              badges.push({ label: `${articleCounts[topic.id]} articles`, color: 'blue' });
            }

            if (topic.parentTopicId) {
              badges.push({ label: 'Subtopic', color: 'gray' });
            }

            return (
              <DragDropCard
                key={topic.id}
                icon={topic.icon}
                iconFallback={<DocumentTextIcon className="w-6 h-6 text-gray-600" />}
                title={topic.title}
                description={topic.description}
                badges={badges}
                isSelected={selectedTopic?.id === topic.id}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onClick={() => setSelectedTopic(selectedTopic?.id === topic.id ? null : topic)}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              />
            );
          })}
          detailContent={
            <DetailPanel
              icon={selectedTopic?.icon}
              iconFallback={<DocumentTextIcon className="w-8 h-8 text-blue-600" />}
              title={selectedTopic?.title}
              description={selectedTopic?.description}
              onEdit={selectedTopic ? handleEditClick : undefined}
              editButtonText="Edit Topic Details"
              emptyStateIcon={<DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
              emptyStateText="Select a topic to manage its content"
              actionsContent={
                selectedTopic ? (
                  <>
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
                  </>
                ) : undefined
              }
            />
          }
          emptyState={
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
          }
        />
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
