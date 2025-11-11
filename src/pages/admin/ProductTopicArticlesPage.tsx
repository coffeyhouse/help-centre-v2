import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { DocumentTextIcon, PlusIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import DragDropCard, { type Badge } from '../../components/admin/DragDropCard';
import DragDropListLayout from '../../components/admin/DragDropListLayout';
import DetailPanel from '../../components/admin/DetailPanel';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ArticleFormModal from '../../components/admin/ArticleFormModal';
import PageHeader from '../../components/admin/PageHeader';

interface Product {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface Article {
  id: string;
  title?: string;
  description?: string;
  type?: 'article' | 'subtopic';
  countries?: string[];
}

export default function ProductTopicArticlesPage() {
  const { region, productId, topicId } = useParams<{ region: string; productId: string; topicId: string }>();

  usePageTitle('Articles', 'Admin');
  const { token } = useAdminAuth();
  const { regions } = useAdminRegion();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [topicsData, setTopicsData] = useState<Topic[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedArticleIndex, setSelectedArticleIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<{ index: number; title: string } | null>(null);
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
  } = useDragAndDrop(articles, (reorderedArticles) => {
    setArticles(reorderedArticles);
    setHasUnsavedChanges(true);
  });

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

      // Load topic details
      const topicResponse = await fetch(`/api/products/${region}/${productId}/topics/${topicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!topicResponse.ok) {
        throw new Error('Failed to load topic');
      }

      const topicResult = await topicResponse.json();
      setTopic(topicResult.topic);

      // Load all topics for this product (for the editor)
      const topicsResponse = await fetch(`/api/products/${region}/${productId}/topics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (topicsResponse.ok) {
        const topicsResult = await topicsResponse.json();
        setTopicsData(topicsResult.data.supportHubs || []);
      }

      // Load articles
      const articlesResponse = await fetch(`/api/products/${region}/${productId}/topics/${topicId}/articles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!articlesResponse.ok) {
        throw new Error('Failed to load articles');
      }

      const articlesResult = await articlesResponse.json();
      setArticles(Array.isArray(articlesResult.articles) ? articlesResult.articles : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
      setHasUnsavedChanges(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch(`/api/products/${region}/${productId}/topics/${topicId}/articles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articles }),
      });

      if (!response.ok) {
        throw new Error('Failed to save articles');
      }

      setSuccessMessage('Changes saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setHasUnsavedChanges(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      console.error('Error saving articles:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    handleDropRaw(e, dropIndex);

    // Update selected article index after reordering
    if (selectedArticleIndex !== null && draggedIndex !== null) {
      if (selectedArticleIndex === draggedIndex) {
        setSelectedArticleIndex(dropIndex);
      } else if (draggedIndex < selectedArticleIndex && dropIndex >= selectedArticleIndex) {
        setSelectedArticleIndex(selectedArticleIndex - 1);
      } else if (draggedIndex > selectedArticleIndex && dropIndex <= selectedArticleIndex) {
        setSelectedArticleIndex(selectedArticleIndex + 1);
      }
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setSelectedArticleIndex(null);
  };

  const handleSelectArticle = (index: number) => {
    setSelectedArticleIndex(index);
    setIsAddingNew(false);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    if (selectedArticleIndex !== null) {
      setArticleToDelete({
        index: selectedArticleIndex,
        title: articles[selectedArticleIndex].title || articles[selectedArticleIndex].id,
      });
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (articleToDelete !== null) {
      const newArticles = articles.filter((_, i) => i !== articleToDelete.index);
      setArticles(newArticles);
      setHasUnsavedChanges(true);

      if (selectedArticleIndex === articleToDelete.index) {
        setSelectedArticleIndex(null);
      } else if (selectedArticleIndex !== null && selectedArticleIndex > articleToDelete.index) {
        setSelectedArticleIndex(selectedArticleIndex - 1);
      }
    }
    setArticleToDelete(null);
  };

  const handleSaveNewArticle = (article: Article) => {
    setArticles([...articles, article]);
    setHasUnsavedChanges(true);
    setSelectedArticleIndex(articles.length);
    setIsAddingNew(false);
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    if (selectedArticleIndex !== null) {
      const newArticles = [...articles];
      newArticles[selectedArticleIndex] = updatedArticle;
      setArticles(newArticles);
      setHasUnsavedChanges(true);
      setIsEditModalOpen(false);
    }
  };

  const selectedArticle = selectedArticleIndex !== null ? articles[selectedArticleIndex] : null;
  const articleCount = articles.length;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: regionName || '' },
        { label: 'Products', path: `/admin/${region}/products` },
        { label: product?.name || productId || '' },
        { label: 'Topics', path: `/admin/${region}/products/${productId}/topics` },
        { label: topic?.title || topicId || '' },
        { label: 'Articles' },
      ]}
    >
      {topic && (
        <PageHeader
          icon={topic.icon}
          iconFallback={<DocumentTextIcon className="w-12 h-12 text-blue-600" />}
          title={topic.title}
          description={topic.description}
          badges={[
            { label: `${articleCount} ${articleCount === 1 ? 'article' : 'articles'}`, color: 'blue' }
          ]}
          onEdit={() => navigate(`/admin/${region}/products/${productId}/topics`)}
          editButtonText="Edit Topic"
          actions={
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Order'}
                </button>
              )}
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Add Article
              </button>
            </div>
          }
        />
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Articles</h2>
        <p className="text-gray-600 text-sm">
          Select an article to manage its content. Drag to reorder.
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
      ) : (
        <DragDropListLayout
          listTitle="All Articles"
          itemCount={articles.length}
          listContent={articles.map((article, index) => {
            const badges: Badge[] = [];

            if (article.type) {
              badges.push({
                label: article.type,
                color: article.type === 'subtopic' ? 'purple' : 'green',
              });
            }

            if (article.countries && article.countries.length > 0) {
              article.countries.forEach((country) => {
                badges.push({
                  label: country.toUpperCase(),
                  color: 'blue',
                });
              });
            }

            // Get the display title - use article title, or if subtopic, get from topicsData
            const displayTitle = article.title ||
              (article.type === 'subtopic' && topicsData
                ? topicsData.find((t) => t.id === article.id)?.title || article.id
                : article.id);

            const displayDescription = article.description ||
              (article.type === 'subtopic' && topicsData
                ? topicsData.find((t) => t.id === article.id)?.description
                : undefined);

            return (
              <DragDropCard
                key={index}
                icon={article.type === 'subtopic' ? <LinkIcon className="w-6 h-6 text-purple-600" /> : undefined}
                iconFallback={<DocumentTextIcon className="w-6 h-6 text-gray-600" />}
                title={displayTitle}
                description={displayDescription}
                badges={badges}
                isSelected={selectedArticleIndex === index}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onClick={() => handleSelectArticle(index)}
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
                icon={selectedArticle?.type === 'subtopic' ? <LinkIcon className="w-8 h-8 text-purple-600" /> : undefined}
                iconFallback={<DocumentTextIcon className="w-8 h-8 text-blue-600" />}
                title={
                  selectedArticle?.title ||
                  (selectedArticle?.type === 'subtopic' && topicsData
                    ? topicsData.find((t) => t.id === selectedArticle.id)?.title
                    : selectedArticle?.id)
                }
                description={
                  selectedArticle?.description ||
                  (selectedArticle?.type === 'subtopic' && topicsData
                    ? topicsData.find((t) => t.id === selectedArticle.id)?.description
                    : undefined)
                }
                onEdit={selectedArticle ? handleEditClick : undefined}
                editButtonText="Edit Article"
                emptyStateIcon={<DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
                emptyStateText="Select an article to view details or add a new one"
                actionsContent={
                  selectedArticle ? (
                    <>
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Article Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500">ID</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedArticle.id}</p>
                        </div>
                        {selectedArticle.type && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Type</label>
                            <p className="text-sm text-gray-900 mt-1 capitalize">{selectedArticle.type}</p>
                          </div>
                        )}
                        {selectedArticle.countries && selectedArticle.countries.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">Countries</label>
                            <div className="flex gap-2 mt-1">
                              {selectedArticle.countries.map((country) => (
                                <span
                                  key={country}
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded uppercase"
                                >
                                  {country}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="pt-4 border-t border-gray-200">
                          <button
                            onClick={handleDeleteClick}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete Article
                          </button>
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
              <p className="text-gray-600 mb-4">No articles found for this topic.</p>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Article
              </button>
            </div>
          }
        />
      )}

      {/* Add/Edit Article Modal */}
      <ArticleFormModal
        isOpen={isAddingNew || isEditModalOpen}
        onClose={() => {
          setIsAddingNew(false);
          setIsEditModalOpen(false);
        }}
        onSave={isAddingNew ? handleSaveNewArticle : handleUpdateArticle}
        article={isEditModalOpen ? selectedArticle : null}
        isNew={isAddingNew}
        topicsData={topicsData}
        countryCodes={currentRegion?.countryCodes}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Article"
        message={`Are you sure you want to delete "${articleToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />
    </AdminLayout>
  );
}
