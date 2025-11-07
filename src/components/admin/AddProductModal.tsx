import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import IconSelector from './IconSelector';

interface Product {
  id: string;
  name: string;
  description: string;
  type: 'cloud' | 'desktop';
  personas: string[];
  categories: string[];
  countries: string[];
  icon: string;
  knowledgebase_collection: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
  region: string;
  existingProduct?: Product; // Optional: if provided, modal is in edit mode
}

export default function AddProductModal({ isOpen, onClose, onProductCreated, region, existingProduct }: AddProductModalProps) {
  const { token } = useAdminAuth();
  const { regions } = useAdminRegion();

  // Determine if we're in edit mode
  const isEditMode = !!existingProduct;

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    type: 'cloud' as 'cloud' | 'desktop',
    icon: '',
    knowledgebase_collection: '',
    categories: [] as string[],
    personas: [] as string[],
    countries: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get available countries for this region
  const currentRegion = regions.find((r) => r.id === region);
  const availableCountries = currentRegion?.countryCodes || [];

  // Available personas
  const availablePersonas = [
    { id: 'customer', label: "I'm a Customer" },
    { id: 'accountant', label: "I'm an Accountant or Bookkeeper" },
  ];

  // Initialize or reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && existingProduct) {
      // Edit mode: populate with existing data
      setFormData({
        id: existingProduct.id,
        name: existingProduct.name,
        description: existingProduct.description,
        type: existingProduct.type,
        icon: existingProduct.icon || '',
        knowledgebase_collection: existingProduct.knowledgebase_collection || '',
        categories: existingProduct.categories || [],
        personas: existingProduct.personas || [],
        countries: existingProduct.countries || [],
      });
      setError('');
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        id: '',
        name: '',
        description: '',
        type: 'cloud',
        icon: '',
        knowledgebase_collection: '',
        categories: [],
        personas: [],
        countries: [],
      });
      setError('');
    }
  }, [isOpen, existingProduct]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const generateId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      id: generateId(name),
    });
  };

  const handleCategoryToggle = (category: string) => {
    const categories = formData.categories || [];
    const isSelected = categories.includes(category);
    const newCategories = isSelected
      ? categories.filter((c) => c !== category)
      : [...categories, category];
    setFormData({ ...formData, categories: newCategories });
  };

  const handlePersonaToggle = (persona: string) => {
    const personas = formData.personas || [];
    const isSelected = personas.includes(persona);
    const newPersonas = isSelected
      ? personas.filter((p) => p !== persona)
      : [...personas, persona];
    setFormData({ ...formData, personas: newPersonas });
  };

  const handleCountryToggle = (country: string) => {
    const countries = formData.countries || [];
    const isSelected = countries.includes(country);
    const newCountries = isSelected
      ? countries.filter((c) => c !== country)
      : [...countries, country];
    setFormData({ ...formData, countries: newCountries });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!formData.id.trim()) {
      setError('Product ID is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Product description is required');
      return;
    }

    if (!formData.categories || formData.categories.length === 0) {
      setError('At least one category is required');
      return;
    }

    setLoading(true);

    try {
      // Convert product ID to folder ID for API endpoint
      const productFolderId = formData.id.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Determine API endpoint and method based on mode
      const endpoint = isEditMode
        ? `/api/products/${region}/${productFolderId}`
        : `/api/products/${region}`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: formData.id,
          name: formData.name,
          description: formData.description,
          type: formData.type,
          icon: formData.icon || '',
          knowledgebase_collection: formData.knowledgebase_collection || '',
          personas: formData.personas.length > 0 ? formData.personas : ['customer', 'accountant'],
          categories: formData.categories,
          countries: formData.countries,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} product`);
      }

      // Success
      onProductCreated();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} product`;
      setError(errorMessage);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} product:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Two-column grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., Accounts Desktop"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Product ID (auto-generated) */}
                  <div>
                    <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                      Product ID *
                    </label>
                    <input
                      type="text"
                      id="id"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      placeholder="e.g., accounts-desktop"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${isEditMode ? 'cursor-not-allowed' : ''}`}
                      required
                      disabled={isEditMode}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {isEditMode ? 'Product ID cannot be changed' : 'Auto-generated from name, but can be edited'}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Brief description of the product"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'cloud' | 'desktop' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="cloud">Cloud</option>
                      <option value="desktop">Desktop</option>
                    </select>
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Icon (optional)
                    </label>
                    <IconSelector
                      value={formData.icon}
                      onChange={(iconName) => setFormData({ ...formData, icon: iconName })}
                    />
                  </div>

                  {/* Knowledgebase Collection (optional) */}
                  <div>
                    <label htmlFor="knowledgebase_collection" className="block text-sm font-medium text-gray-700 mb-1">
                      Knowledgebase Collection ID (optional)
                    </label>
                    <input
                      type="text"
                      id="knowledgebase_collection"
                      value={formData.knowledgebase_collection}
                      onChange={(e) => setFormData({ ...formData, knowledgebase_collection: e.target.value })}
                      placeholder="e.g., custom_gb_en_fifty_accounts"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The collection ID used for filtering search results
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Categories (required) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories *
                    </label>
                    <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                      {[
                        { id: 'accounting-software', label: 'Accounting software' },
                        { id: 'people-payroll', label: 'People and Payroll' },
                        { id: 'business-management', label: 'Business management' },
                        { id: 'solutions-accountants-bookkeepers', label: 'Solutions for accountants and bookkeepers' }
                      ].map((category) => (
                        <label key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(category.id)}
                            onChange={() => handleCategoryToggle(category.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Select one or more categories to display this product on the homepage
                    </p>
                  </div>

                  {/* Personas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Personas (optional)
                    </label>
                    <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                      {availablePersonas.map((persona) => (
                        <label key={persona.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.personas.includes(persona.id)}
                            onChange={() => handlePersonaToggle(persona.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{persona.label}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to show for all personas, or select specific personas
                    </p>
                  </div>

                  {/* Countries */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Countries (optional)
                    </label>
                    <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                      {availableCountries.length > 0 ? (
                        availableCountries.map((countryCode) => (
                          <label key={countryCode} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.countries.includes(countryCode)}
                              onChange={() => handleCountryToggle(countryCode)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 uppercase">{countryCode}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No countries configured for this region</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to show in all countries, or select specific countries
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
