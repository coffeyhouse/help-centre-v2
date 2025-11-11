import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { ExclamationTriangleIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import DragDropCard, { type Badge } from '../../components/admin/DragDropCard';
import DragDropListLayout from '../../components/admin/DragDropListLayout';
import DetailPanel from '../../components/admin/DetailPanel';
import BannerFormModal, { type Banner } from '../../components/admin/BannerFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

interface Product {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  title: string;
}

export default function IncidentsPage() {
  const { region } = useParams<{ region: string }>();
  const { token } = useAdminAuth();
  const { regions } = useAdminRegion();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedBannerIndex, setSelectedBannerIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<{ index: number; title: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  usePageTitle('Incidents', 'Admin');

  const currentRegion = regions.find((r) => r.id === region);
  const regionName = currentRegion?.name || region;

  // Drag and drop functionality
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop: handleDropRaw,
    handleDragEnd,
  } = useDragAndDrop(banners, (reorderedBanners) => {
    setBanners(reorderedBanners);
    setHasUnsavedChanges(true);
  });

  useEffect(() => {
    loadData();
    loadProducts();
  }, [region]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/regions/${region}/incidents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load incidents data');
      }

      const result = await response.json();
      setBanners(result.data.banners || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch(`/api/files/${region}-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load products');
      }

      const result = await response.json();
      setProducts(result.data.products || []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch(`/api/regions/${region}/incidents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { banners } }),
      });

      if (!response.ok) {
        throw new Error('Failed to save incidents data');
      }

      setSuccessMessage('Changes saved successfully');
      setHasUnsavedChanges(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      console.error('Error saving incidents:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    handleDropRaw(e, dropIndex);

    // Update selected banner index after reordering
    if (selectedBannerIndex !== null && draggedIndex !== null) {
      if (selectedBannerIndex === draggedIndex) {
        setSelectedBannerIndex(dropIndex);
      } else if (draggedIndex < selectedBannerIndex && dropIndex >= selectedBannerIndex) {
        setSelectedBannerIndex(selectedBannerIndex - 1);
      } else if (draggedIndex > selectedBannerIndex && dropIndex <= selectedBannerIndex) {
        setSelectedBannerIndex(selectedBannerIndex + 1);
      }
    }
  };

  const handleSelectBanner = (index: number) => {
    // Toggle selection - if clicking the same card, unselect it
    setSelectedBannerIndex(selectedBannerIndex === index ? null : index);
  };

  const handleAddBanner = () => {
    setIsAddModalOpen(true);
  };

  const handleEditBanner = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveBanner = (banner: Banner) => {
    setBanners([...banners, banner]);
    setHasUnsavedChanges(true);
    setIsAddModalOpen(false);
  };

  const handleUpdateBanner = (updatedBanner: Banner) => {
    if (selectedBannerIndex !== null) {
      const newBanners = [...banners];
      newBanners[selectedBannerIndex] = updatedBanner;
      setBanners(newBanners);
      setHasUnsavedChanges(true);
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteClick = () => {
    if (selectedBannerIndex !== null) {
      setBannerToDelete({
        index: selectedBannerIndex,
        title: banners[selectedBannerIndex].title,
      });
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (bannerToDelete !== null) {
      const newBanners = banners.filter((_, i) => i !== bannerToDelete.index);
      setBanners(newBanners);
      setHasUnsavedChanges(true);

      if (selectedBannerIndex === bannerToDelete.index) {
        setSelectedBannerIndex(null);
      } else if (selectedBannerIndex !== null && selectedBannerIndex > bannerToDelete.index) {
        setSelectedBannerIndex(selectedBannerIndex - 1);
      }
      setIsEditModalOpen(false);
    }
    setBannerToDelete(null);
  };

  const getStateColor = (state: string): Badge['color'] => {
    switch (state) {
      case 'error':
        return 'red';
      case 'caution':
        return 'yellow';
      case 'resolved':
        return 'green';
      case 'info':
      default:
        return 'blue';
    }
  };

  const getProductName = (productId: string): string => {
    const product = products.find((p) => p.id === productId);
    return product?.name || productId;
  };

  const getPagePatternLabel = (pattern: string): string => {
    const patternLabels: Record<string, string> = {
      '/:region/contact': 'Contact page',
    };
    return patternLabels[pattern] || pattern;
  };

  const selectedBanner = selectedBannerIndex !== null ? banners[selectedBannerIndex] : null;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: regionName || '' },
        { label: 'Incidents' },
      ]}
    >
      <PageHeader
        icon={<ExclamationTriangleIcon className="w-12 h-12 text-blue-600" />}
        title="Incident Banners"
        description={`Manage incident banners and alerts for ${regionName}`}
        badges={[
          { label: `${banners.length} ${banners.length === 1 ? 'banner' : 'banners'}`, color: 'blue' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button
              onClick={handleAddBanner}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add Banner
            </button>
          </div>
        }
      />

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
          <p className="mt-4 text-gray-600">Loading incidents...</p>
        </div>
      ) : (
        <DragDropListLayout
          listTitle="All Banners"
          itemCount={banners.length}
          listContent={banners.map((banner, index) => {
            const badges: Badge[] = [];

            // State badge
            badges.push({
              label: banner.state,
              color: getStateColor(banner.state),
            });

            // Active badge
            badges.push({
              label: banner.active ? 'Active' : 'Inactive',
              color: banner.active ? 'green' : 'gray',
            });

            // Scope badge
            if (banner.scope.type !== 'global') {
              badges.push({
                label: banner.scope.type,
                color: 'purple',
              });
            }

            return (
              <DragDropCard
                key={banner.id}
                icon={<ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />}
                title={banner.title}
                description={banner.message}
                badges={badges}
                isSelected={selectedBannerIndex === index}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onClick={() => handleSelectBanner(index)}
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
              icon={<ExclamationTriangleIcon className="w-8 h-8 text-blue-600" />}
              title={selectedBanner?.title}
              description={selectedBanner?.message}
              onEdit={selectedBanner ? handleEditBanner : undefined}
              editButtonText="Edit Banner"
              emptyStateIcon={<ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
              emptyStateText="Select a banner to view details"
              actionsContent={
                selectedBanner ? (
                  <>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Banner Details</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">ID:</span>
                        <span className="ml-2 text-gray-600">{selectedBanner.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">State:</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${
                          selectedBanner.state === 'error' ? 'bg-red-100 text-red-800' :
                          selectedBanner.state === 'caution' ? 'bg-yellow-100 text-yellow-800' :
                          selectedBanner.state === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedBanner.state}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${
                          selectedBanner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedBanner.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Scope:</span>
                        <span className="ml-2 text-gray-600 capitalize">{selectedBanner.scope.type}</span>
                      </div>

                      {/* Product scope details */}
                      {selectedBanner.scope.type === 'product' && selectedBanner.scope.productIds && selectedBanner.scope.productIds.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Products:</span>
                          <div className="ml-2 mt-1 space-y-1">
                            {selectedBanner.scope.productIds.map((productId) => (
                              <div key={productId} className="text-sm text-gray-600">
                                • {getProductName(productId)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Topic scope details */}
                      {selectedBanner.scope.type === 'topic' && (
                        <>
                          {selectedBanner.scope.productIds && selectedBanner.scope.productIds.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Product:</span>
                              <span className="ml-2 text-gray-600">{getProductName(selectedBanner.scope.productIds[0])}</span>
                            </div>
                          )}
                          {selectedBanner.scope.topicIds && selectedBanner.scope.topicIds.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Topics:</span>
                              <div className="ml-2 mt-1 space-y-1">
                                {selectedBanner.scope.topicIds.map((topicId) => (
                                  <div key={topicId} className="text-sm text-gray-600">
                                    • {topicId}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Page scope details */}
                      {selectedBanner.scope.type === 'page' && selectedBanner.scope.pagePatterns && selectedBanner.scope.pagePatterns.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Pages:</span>
                          <div className="ml-2 mt-1 space-y-1">
                            {selectedBanner.scope.pagePatterns.map((pattern) => (
                              <div key={pattern} className="text-sm text-gray-600">
                                • {getPagePatternLabel(pattern)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedBanner.link && (
                        <div>
                          <span className="font-medium text-gray-700">Link:</span>
                          <div className="ml-2 mt-1">
                            <a
                              href={selectedBanner.link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {selectedBanner.link.text}
                            </a>
                          </div>
                        </div>
                      )}
                      {selectedBanner.countries && selectedBanner.countries.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Countries:</span>
                          <span className="ml-2 text-gray-600">{selectedBanner.countries.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : undefined
              }
            />
          }
          emptyState={
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No incident banners found.</p>
              <button
                onClick={handleAddBanner}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Banner
              </button>
            </div>
          }
        />
      )}

      {/* Add Banner Modal */}
      <BannerFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        banner={null}
        onSave={handleSaveBanner}
      />

      {/* Edit Banner Modal */}
      {selectedBanner && (
        <BannerFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          banner={selectedBanner}
          onSave={handleUpdateBanner}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Banner"
        message={`Are you sure you want to delete "${bannerToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />
    </AdminLayout>
  );
}
