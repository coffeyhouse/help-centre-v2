import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import {
  CubeIcon,
  PlusIcon,
  BookOpenIcon,
  PhoneIcon,
  DocumentTextIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import AddProductModal from '../../components/admin/AddProductModal';
import PageHeader, { type PageHeaderBadge } from '../../components/admin/PageHeader';
import DragDropCard, { type Badge } from '../../components/admin/DragDropCard';
import DragDropListLayout from '../../components/admin/DragDropListLayout';
import DetailPanel from '../../components/admin/DetailPanel';

interface Product {
  id: string;
  name: string;
  description: string;
  type: 'cloud' | 'desktop';
  icon?: string;
  personas?: string[];
  categories?: string[];
  countries?: string[];
  knowledgebase_collection?: string;
}

interface MenuOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  comingSoon?: boolean;
}

export default function ProductsListPage() {
  const { region } = useParams<{ region: string }>();
  const { token } = useAdminAuth();
  const { regions } = useAdminRegion();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  usePageTitle('Products', 'Admin');

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
  } = useDragAndDrop(products, (reorderedProducts) => {
    setProducts(reorderedProducts);
    setHasUnsavedChanges(true);
  });

  useEffect(() => {
    loadProducts();
  }, [region]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    handleDropRaw(e, dropIndex);

    // Update selected product index after reordering
    if (selectedProductIndex !== null && draggedIndex !== null) {
      if (selectedProductIndex === draggedIndex) {
        setSelectedProductIndex(dropIndex);
      } else if (draggedIndex < selectedProductIndex && dropIndex >= selectedProductIndex) {
        setSelectedProductIndex(selectedProductIndex - 1);
      } else if (draggedIndex > selectedProductIndex && dropIndex <= selectedProductIndex) {
        setSelectedProductIndex(selectedProductIndex + 1);
      }
    }
  };

  const handleSelectProduct = (index: number) => {
    // Toggle selection - if clicking the same card, unselect it
    setSelectedProductIndex(selectedProductIndex === index ? null : index);
  };

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  const handleEditProduct = () => {
    setIsEditModalOpen(true);
  };

  const handleProductCreated = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    loadProducts();
  };

  const handleMenuOptionClick = (path: string) => {
    navigate(path);
  };

  const selectedProduct = selectedProductIndex !== null ? products[selectedProductIndex] : null;

  const getMenuOptions = (product: Product): MenuOption[] => [
    {
      id: 'topics',
      title: 'Topics',
      description: 'Manage support topics and articles for this product',
      icon: <BookOpenIcon className="w-5 h-5 text-blue-600" />,
      path: `/admin/${region}/products/${product.id}/topics`,
      color: 'blue',
    },
    {
      id: 'contact',
      title: 'Contact Options',
      description: 'Currently managed at region level',
      icon: <PhoneIcon className="w-5 h-5 text-green-600" />,
      path: `/admin/${region}/contact`,
      color: 'green',
      comingSoon: true,
    },
    {
      id: 'release-notes',
      title: 'Release Notes',
      description: 'Currently managed at region level',
      icon: <DocumentTextIcon className="w-5 h-5 text-indigo-600" />,
      path: `/admin/${region}/release-notes`,
      color: 'indigo',
      comingSoon: true,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; hover: string }> = {
      blue: { bg: 'bg-blue-100', hover: 'group-hover:bg-blue-200' },
      green: { bg: 'bg-green-100', hover: 'group-hover:bg-green-200' },
      indigo: { bg: 'bg-indigo-100', hover: 'group-hover:bg-indigo-200' },
    };
    return colorMap[color] || colorMap.blue;
  };

  const getProductBadges = (): PageHeaderBadge[] => {
    const badges: PageHeaderBadge[] = [];

    badges.push({
      label: `${products.length} ${products.length === 1 ? 'product' : 'products'}`,
      color: 'blue',
    });

    return badges;
  };

  return (
    <AdminLayout
      breadcrumbs={[
        { label: regionName || '' },
        { label: 'Products' },
      ]}
    >
      <PageHeader
        icon={<CubeIcon className="w-12 h-12 text-blue-600" />}
        title="Products"
        description="Select a product to manage its content and settings. Drag to reorder."
        badges={getProductBadges()}
        actions={
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Product
          </button>
        }
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <DragDropListLayout
          listTitle="All Products"
          itemCount={products.length}
          listContent={products.map((product, index) => {
            const badges: Badge[] = [];

            // Type badge
            badges.push({
              label: product.type === 'cloud' ? 'Cloud' : 'Desktop',
              color: product.type === 'cloud' ? 'blue' : 'gray',
            });

            // Personas
            if (product.personas && product.personas.length > 0) {
              product.personas.forEach((persona) => {
                badges.push({ label: persona, color: 'purple' });
              });
            }

            return (
              <DragDropCard
                key={product.id}
                icon={product.icon}
                iconFallback={<CubeIcon className="w-6 h-6 text-gray-600" />}
                title={product.name}
                description={product.description}
                badges={badges}
                isSelected={selectedProductIndex === index}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onClick={() => handleSelectProduct(index)}
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
              icon={selectedProduct?.icon}
              iconFallback={<CubeIcon className="w-8 h-8 text-blue-600" />}
              title={selectedProduct?.name}
              description={selectedProduct ? (() => {
                const parts: string[] = [];
                parts.push(selectedProduct.description);
                if (selectedProduct.knowledgebase_collection) {
                  parts.push(`KB: ${selectedProduct.knowledgebase_collection}`);
                }
                return parts.join(' • ');
              })() : undefined}
              onEdit={selectedProduct ? handleEditProduct : undefined}
              editButtonText="Edit Product"
              emptyStateIcon={<CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
              emptyStateText="Select a product to manage its content"
              actionsContent={
                selectedProduct ? (
                  <>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Manage Content</h4>
                    <div className="space-y-3">
                      {getMenuOptions(selectedProduct).map((option) => {
                        const colors = getColorClasses(option.color);
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleMenuOptionClick(option.path)}
                            disabled={option.comingSoon}
                            className={`w-full group bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left ${
                              option.comingSoon ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg transition-colors ${colors.bg} ${colors.hover}`}>
                                  {option.icon}
                                </div>
                                <div>
                                  <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
                                    {option.title}
                                    {option.comingSoon && (
                                      <span className="text-xs font-normal px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                                        Region-level
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">{option.description}</div>
                                </div>
                              </div>
                              {!option.comingSoon && (
                                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : undefined
              }
            />
          }
          emptyState={
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No products found for this region.</p>
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Product
              </button>
            </div>
          }
        />
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductCreated={handleProductCreated}
        region={region!}
      />

      {/* Edit Product Modal */}
      {selectedProduct && (
        <AddProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProductCreated={handleProductCreated}
          region={region!}
          existingProduct={selectedProduct}
        />
      )}
    </AdminLayout>
  );
}
