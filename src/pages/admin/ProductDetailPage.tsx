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
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Icon from '../../components/common/Icon';
import IconSelector from '../../components/admin/IconSelector';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [availableCountries, setAvailableCountries] = useState<Array<{ code: string; name: string }>>([]);

  usePageTitle(product?.name || 'Product', 'Admin');

  const currentRegion = regions.find((r) => r.id === region);
  const regionName = currentRegion?.name || region;

  useEffect(() => {
    loadProduct();
  }, [region, productId]);

  useEffect(() => {
    // Load available countries from regions.json
    const loadCountries = async () => {
      try {
        const response = await fetch('/data/regions.json');
        const regionsData = await response.json();
        setAvailableCountries(regionsData);
      } catch (error) {
        console.error('Failed to load countries:', error);
        // Fallback to common countries
        setAvailableCountries([
          { code: 'gb', name: 'United Kingdom' },
          { code: 'ie', name: 'Ireland' },
          { code: 'us', name: 'United States' },
          { code: 'ca', name: 'Canada' },
        ]);
      }
    };
    loadCountries();
  }, []);

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
    setEditedProduct(product ? { ...product } : null);
    setIsEditing(true);
    setSaveError('');
  };

  const handleCancel = () => {
    if (JSON.stringify(editedProduct) !== JSON.stringify(product)) {
      setShowCancelConfirm(true);
    } else {
      setIsEditing(false);
      setEditedProduct(null);
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    setIsEditing(false);
    setEditedProduct(null);
    setSaveError('');
  };

  const handleSave = async () => {
    if (!editedProduct) return;

    try {
      setSaving(true);
      setSaveError('');

      // Fetch current products data
      const fetchResponse = await fetch(`/api/files/${region}-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!fetchResponse.ok) {
        throw new Error('Failed to load products data');
      }

      const result = await fetchResponse.json();
      const productsData = result.data;

      // Update the product in the array
      const updatedProducts = productsData.products.map((p: Product) =>
        p.id === productId ? editedProduct : p
      );

      // Save back to the API
      const saveResponse = await fetch(`/api/files/${region}-products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            ...productsData,
            products: updatedProducts,
          },
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save product changes');
      }

      setProduct(editedProduct);
      setIsEditing(false);
      setEditedProduct(null);
      setSaveError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      setSaveError(errorMessage);
      console.error('Error saving product:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof Product, value: any) => {
    if (editedProduct) {
      setEditedProduct({ ...editedProduct, [field]: value });
    }
  };

  const handlePersonaToggle = (persona: string) => {
    if (editedProduct) {
      const personas = editedProduct.personas || [];
      const isSelected = personas.includes(persona);
      const newPersonas = isSelected
        ? personas.filter((p) => p !== persona)
        : [...personas, persona];
      setEditedProduct({ ...editedProduct, personas: newPersonas });
    }
  };

  const handleCategoryToggle = (category: string) => {
    if (editedProduct) {
      const categories = editedProduct.categories || [];
      const isSelected = categories.includes(category);
      const newCategories = isSelected
        ? categories.filter((c) => c !== category)
        : [...categories, category];
      setEditedProduct({ ...editedProduct, categories: newCategories });
    }
  };

  const handleCountryToggle = (country: string) => {
    if (editedProduct) {
      const countries = editedProduct.countries || [];
      const isSelected = countries.includes(country);
      const newCountries = isSelected
        ? countries.filter((c) => c !== country)
        : [...countries, country];
      setEditedProduct({ ...editedProduct, countries: newCountries });
    }
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
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            {!isEditing ? (
              <>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-4 rounded-lg flex-shrink-0">
                    {product.icon ? (
                      <Icon name={product.icon} className="w-12 h-12 text-blue-600" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl">
                        {product.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                        <p className="text-gray-600 mb-2">{product.description}</p>
                        {product.knowledgebase_collection && (
                          <p className="text-sm text-gray-500 mb-2">
                            <span className="font-medium">KB Collection:</span> {product.knowledgebase_collection}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                            product.type === 'cloud'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {product.type === 'cloud' ? 'Cloud Product' : 'Desktop Product'}
                          </span>
                          {product.personas && product.personas.length > 0 && (
                            <>
                              {product.personas.map((persona) => (
                                <span
                                  key={persona}
                                  className="inline-block px-3 py-1 text-sm font-medium rounded bg-purple-100 text-purple-700"
                                >
                                  {persona}
                                </span>
                              ))}
                            </>
                          )}
                          {product.categories && product.categories.length > 0 && (
                            <>
                              {product.categories.map((category) => {
                                const categoryLabels: Record<string, string> = {
                                  'accounting-software': 'Accounting software',
                                  'people-payroll': 'People and Payroll',
                                  'business-management': 'Business management',
                                  'solutions-accountants-bookkeepers': 'Solutions for accountants and bookkeepers',
                                };
                                return (
                                  <span
                                    key={category}
                                    className="inline-block px-3 py-1 text-sm font-medium rounded bg-indigo-100 text-indigo-700"
                                  >
                                    {categoryLabels[category] || category}
                                  </span>
                                );
                              })}
                            </>
                          )}
                          {product.countries && product.countries.length > 0 && (
                            <>
                              {product.countries.map((country) => (
                                <span
                                  key={country}
                                  className="inline-block px-3 py-1 text-sm font-medium rounded bg-green-100 text-green-700"
                                >
                                  {country.toUpperCase()}
                                </span>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit Details
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Edit Form */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Product Details</h3>
                    <button
                      onClick={handleCancel}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {saveError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {saveError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID
                      </label>
                      <input
                        type="text"
                        value={editedProduct?.id || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Product ID cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editedProduct?.name || ''}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={editedProduct?.description || ''}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editedProduct?.type || 'cloud'}
                        onChange={(e) => handleFieldChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="cloud">Cloud</option>
                        <option value="desktop">Desktop</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <IconSelector
                        value={editedProduct?.icon || ''}
                        onChange={(value) => handleFieldChange('icon', value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Select an icon for this product
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Knowledgebase Collection ID
                      </label>
                      <input
                        type="text"
                        value={editedProduct?.knowledgebase_collection || ''}
                        onChange={(e) => handleFieldChange('knowledgebase_collection', e.target.value)}
                        placeholder="e.g., custom_gb_en_fifty_accounts"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        The collection ID used for filtering search results for this product
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Personas
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {['customer', 'accountant', 'partner', 'developer'].map((persona) => (
                          <label key={persona} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={(editedProduct?.personas || []).includes(persona)}
                              onChange={() => handlePersonaToggle(persona)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{persona}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categories <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { id: 'accounting-software', label: 'Accounting software' },
                          { id: 'people-payroll', label: 'People and Payroll' },
                          { id: 'business-management', label: 'Business management' },
                          { id: 'solutions-accountants-bookkeepers', label: 'Solutions for accountants and bookkeepers' }
                        ].map((category) => (
                          <label key={category.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={(editedProduct?.categories || []).includes(category.id)}
                              onChange={() => handleCategoryToggle(category.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Select one or more categories to display this product on the homepage
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Countries
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {availableCountries.map((country) => (
                          <label key={country.code} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={(editedProduct?.countries || []).includes(country.code)}
                              onChange={() => handleCountryToggle(country.code)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {country.name} ({country.code.toUpperCase()})
                            </span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Select countries where this product is available
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-5 w-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

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

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancel}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel? All changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Keep Editing"
        confirmStyle="danger"
      />
    </AdminLayout>
  );
}
