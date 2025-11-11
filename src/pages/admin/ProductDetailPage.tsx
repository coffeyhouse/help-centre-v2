import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  BookOpenIcon,
  PhoneIcon,
  DocumentTextIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import AddProductModal from '../../components/admin/AddProductModal';
import PageHeader, { type PageHeaderBadge, type PageHeaderMetadata } from '../../components/admin/PageHeader';

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

interface SubSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  comingSoon?: boolean;
}

export default function ProductDetailPage() {
  const { region, productId } = useParams<{ region: string; productId: string }>();
  const { token } = useAdminAuth();
  const { regions } = useAdminRegion();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  usePageTitle(product?.name || 'Product', 'Admin');

  const currentRegion = regions.find((r) => r.id === region);
  const regionName = currentRegion?.name || region;

  useEffect(() => {
    loadProduct();
  }, [region, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/files/${region}-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load product');
      }

      const result = await response.json();
      const foundProduct = result.data.products?.find((p: Product) => p.id === productId);

      if (!foundProduct) {
        throw new Error('Product not found');
      }

      setProduct(foundProduct);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load product';
      setError(errorMessage);
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleProductUpdated = () => {
    // Reload the product after it's been updated
    loadProduct();
  };

  const subSections: SubSection[] = [
    {
      id: 'topics',
      title: 'Topics',
      description: 'Manage support topics and articles for this product',
      icon: <BookOpenIcon className="w-8 h-8" />,
      path: `/admin/${region}/products/${productId}/topics`,
      color: 'blue',
    },
    {
      id: 'contact',
      title: 'Contact Options',
      description: 'Currently managed at region level',
      icon: <PhoneIcon className="w-8 h-8" />,
      path: `/admin/${region}/contact`,
      color: 'green',
      comingSoon: true,
    },
    {
      id: 'release-notes',
      title: 'Release Notes',
      description: 'Currently managed at region level',
      icon: <DocumentTextIcon className="w-8 h-8" />,
      path: `/admin/${region}/release-notes`,
      color: 'indigo',
      comingSoon: true,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; icon: string; hover: string; border: string }> = {
      blue: {
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        hover: 'group-hover:bg-blue-200',
        border: 'hover:border-blue-500',
      },
      green: {
        bg: 'bg-green-100',
        icon: 'text-green-600',
        hover: 'group-hover:bg-green-200',
        border: 'hover:border-green-500',
      },
      indigo: {
        bg: 'bg-indigo-100',
        icon: 'text-indigo-600',
        hover: 'group-hover:bg-indigo-200',
        border: 'hover:border-indigo-500',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const handleSectionClick = (path: string) => {
    navigate(path);
  };

  return (
    <AdminLayout
      breadcrumbs={[
        { label: regionName || '', path: `/admin/${region}/menu` },
        { label: 'Products', path: `/admin/${region}/products` },
        { label: product?.name || productId || '' },
      ]}
    >
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : product ? (
        <>
          {/* Product Header */}
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
            badges={(() => {
              const badges: PageHeaderBadge[] = [];

              // Type badge
              badges.push({
                label: product.type === 'cloud' ? 'Cloud Product' : 'Desktop Product',
                color: product.type === 'cloud' ? 'blue' : 'gray',
              });

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
            })()}
            onEdit={handleEdit}
          />

          {/* Sub-sections */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Manage Content</h2>
            <p className="text-gray-600 text-sm mb-4">
              Select a section to manage content for this product
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {subSections.map((section) => {
              const colors = getColorClasses(section.color);
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.path)}
                  className={`group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all text-left border-2 border-transparent ${colors.border}`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`${colors.bg} p-3 rounded-lg transition-colors ${colors.hover}`}
                      >
                        <div className={colors.icon}>{section.icon}</div>
                      </div>
                      <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 flex items-center gap-2">
                      {section.title}
                      {section.comingSoon && (
                        <span className="text-xs font-normal px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                          Region-level
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {/* Edit Product Modal */}
      {region && product && (
        <AddProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onProductCreated={handleProductUpdated}
          region={region}
          existingProduct={product}
        />
      )}
    </AdminLayout>
  );
}
