import { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useFormChangeTracking } from '../../hooks/useFormChangeTracking';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useParams } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';

interface Product {
  id: string;
  name: string;
  topicIds?: string[];
}

interface Topic {
  id: string;
  title: string;
}

export interface Banner {
  id: string;
  state: 'caution' | 'error' | 'info' | 'resolved';
  title: string;
  message: string;
  link?: {
    text: string;
    url: string;
  };
  scope: {
    type: 'global' | 'product' | 'page' | 'topic';
    productIds?: string[];
    pagePatterns?: string[];
    topicIds?: string[];
  };
  active: boolean;
  countries?: string[];
}

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: Banner | null;
  onSave: (banner: Banner) => void;
  onDelete?: () => void;
}

export default function BannerFormModal({
  isOpen,
  onClose,
  banner,
  onSave,
  onDelete,
}: BannerFormModalProps) {
  const { token } = useAdminAuth();
  const { region } = useParams<{ region: string }>();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [hasLink, setHasLink] = useState(!!banner?.link);
  const [products, setProducts] = useState<Product[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedProductForTopics, setSelectedProductForTopics] = useState<string>('');

  const isNew = !banner;

  // Use the change tracking hook
  const { formData, setFormData, hasChanges } = useFormChangeTracking<Banner>(
    banner || {
      id: '',
      state: 'info',
      title: '',
      message: '',
      scope: { type: 'global' },
      active: false,
    }
  );

  // Load products when modal opens
  useEffect(() => {
    if (isOpen && region) {
      loadProducts();
    }
  }, [isOpen, region]);

  // Load topics when product is selected for topic scope
  useEffect(() => {
    if (selectedProductForTopics && formData?.scope.type === 'topic') {
      loadTopicsForProduct(selectedProductForTopics);
    }
  }, [selectedProductForTopics, formData?.scope.type]);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleCancel();
      };
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
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
      setLoadingProducts(false);
    }
  };

  const loadTopicsForProduct = async (productId: string) => {
    try {
      setLoadingTopics(true);
      const response = await fetch(`/api/products/${region}/${productId}/topics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load topics');
      }

      const result = await response.json();
      setTopics(result.data.supportHubs || []);
    } catch (err) {
      console.error('Error loading topics:', err);
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (field: keyof Banner, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleLinkToggle = (checked: boolean) => {
    setHasLink(checked);
    if (!checked && formData) {
      const { link, ...rest } = formData;
      setFormData(rest as Banner);
    } else if (checked && formData) {
      setFormData({ ...formData, link: { text: '', url: '' } });
    }
  };

  const handleLinkChange = (field: 'text' | 'url', value: string) => {
    if (formData?.link) {
      setFormData({
        ...formData,
        link: { ...formData.link, [field]: value },
      });
    }
  };

  const handleScopeChange = (field: string, value: any) => {
    if (formData) {
      // When scope type changes, clear related fields
      if (field === 'type') {
        const newScope: Banner['scope'] = { type: value };
        setFormData({
          ...formData,
          scope: newScope,
        });
        setSelectedProductForTopics('');
        setTopics([]);
      } else {
        setFormData({
          ...formData,
          scope: { ...formData.scope, [field]: value },
        });
      }
    }
  };

  const handleProductToggle = (productId: string) => {
    if (!formData) return;
    const currentProductIds = formData.scope.productIds || [];
    const isSelected = currentProductIds.includes(productId);
    const newProductIds = isSelected
      ? currentProductIds.filter((id) => id !== productId)
      : [...currentProductIds, productId];

    setFormData({
      ...formData,
      scope: { ...formData.scope, productIds: newProductIds },
    });
  };

  const handleTopicToggle = (topicId: string) => {
    if (!formData) return;
    const currentTopicIds = formData.scope.topicIds || [];
    const isSelected = currentTopicIds.includes(topicId);
    const newTopicIds = isSelected
      ? currentTopicIds.filter((id) => id !== topicId)
      : [...currentTopicIds, topicId];

    setFormData({
      ...formData,
      scope: { ...formData.scope, topicIds: newTopicIds },
    });
  };

  const handlePagePatternChange = (pattern: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      scope: { ...formData.scope, pagePatterns: pattern ? [pattern] : [] },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Validate scope-specific fields
    if (formData.scope.type === 'product' && (!formData.scope.productIds || formData.scope.productIds.length === 0)) {
      alert('Please select at least one product for product scope');
      return;
    }

    if (formData.scope.type === 'topic') {
      if (!formData.scope.productIds || formData.scope.productIds.length === 0) {
        alert('Please select at least one product for topic scope');
        return;
      }
      if (!formData.scope.topicIds || formData.scope.topicIds.length === 0) {
        alert('Please select at least one topic for topic scope');
        return;
      }
    }

    if (formData.scope.type === 'page' && (!formData.scope.pagePatterns || formData.scope.pagePatterns.length === 0)) {
      alert('Please select a page pattern for page scope');
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onClose();
  };

  if (!formData) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleCancel}
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
                  {isNew ? 'New Banner' : 'Edit Banner'}
                </h3>
                <button
                  type="button"
                  onClick={handleCancel}
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
                {/* Two-column grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Fields */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                        ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="id"
                        value={formData.id}
                        onChange={(e) => handleChange('id', e.target.value)}
                        disabled={!isNew}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isNew ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="e.g., maintenance-2025-01-15"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {isNew ? 'Unique identifier (use lowercase with hyphens)' : 'ID cannot be changed after creation'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleChange('state', e.target.value as Banner['state'])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="info">Info</option>
                          <option value="caution">Caution</option>
                          <option value="error">Error</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>

                      <div className="flex items-center pt-7">
                        <input
                          type="checkbox"
                          id="active"
                          checked={formData.active}
                          onChange={(e) => handleChange('active', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                          Active
                        </label>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Scheduled Maintenance"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Detailed message to display..."
                        required
                      />
                    </div>

                    {/* Link Section */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hasLink"
                          checked={hasLink}
                          onChange={(e) => handleLinkToggle(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="hasLink" className="ml-2 text-sm font-medium text-gray-700">
                          Include link
                        </label>
                      </div>

                      {hasLink && formData.link && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="linkText" className="block text-sm font-medium text-gray-700 mb-1">
                              Link Text <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="linkText"
                              value={formData.link.text}
                              onChange={(e) => handleLinkChange('text', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Learn more"
                              required={hasLink}
                            />
                          </div>
                          <div>
                            <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">
                              URL <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="linkUrl"
                              value={formData.link.url}
                              onChange={(e) => handleLinkChange('url', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="https://..."
                              required={hasLink}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Scope Configuration */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="scopeType" className="block text-sm font-medium text-gray-700 mb-1">
                        Scope Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="scopeType"
                        value={formData.scope.type}
                        onChange={(e) => handleScopeChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="global">Global</option>
                        <option value="product">Product</option>
                        <option value="topic">Topic</option>
                        <option value="page">Page</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Where this banner should be displayed
                      </p>
                    </div>

                    {/* Global Scope - Help Text */}
                    {formData.scope.type === 'global' && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <p className="text-sm text-gray-600">
                          This banner will be displayed on all pages across the site.
                        </p>
                      </div>
                    )}

                    {/* Product Scope - Multi-select */}
                    {formData.scope.type === 'product' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Products <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
                          {loadingProducts ? (
                            <p className="text-sm text-gray-500">Loading products...</p>
                          ) : products.length > 0 ? (
                            products.map((product) => (
                              <label key={product.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.scope.productIds?.includes(product.id) || false}
                                  onChange={() => handleProductToggle(product.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{product.name}</span>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No products available</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Select products where this banner should appear
                        </p>
                      </div>
                    )}

                    {/* Topic Scope - Product selection then Topic multi-select */}
                    {formData.scope.type === 'topic' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Products <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
                            {loadingProducts ? (
                              <p className="text-sm text-gray-500">Loading products...</p>
                            ) : products.length > 0 ? (
                              products.map((product) => (
                                <label key={product.id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.scope.productIds?.includes(product.id) || false}
                                    onChange={() => handleProductToggle(product.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{product.name}</span>
                                </label>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">No products available</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Select products for topic filtering
                          </p>
                        </div>

                        <div>
                          <label htmlFor="productForTopics" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Product to Load Topics <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="productForTopics"
                            value={selectedProductForTopics}
                            onChange={(e) => setSelectedProductForTopics(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Choose a product...</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Select a product to view its topics
                          </p>
                        </div>

                        {selectedProductForTopics && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Topics <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
                              {loadingTopics ? (
                                <p className="text-sm text-gray-500">Loading topics...</p>
                              ) : topics.length > 0 ? (
                                topics.map((topic) => (
                                  <label key={topic.id} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={formData.scope.topicIds?.includes(topic.id) || false}
                                      onChange={() => handleTopicToggle(topic.id)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{topic.title}</span>
                                  </label>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">No topics available for this product</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Select topics where this banner should appear
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Page Scope - Pre-defined patterns */}
                    {formData.scope.type === 'page' && (
                      <div>
                        <label htmlFor="pagePattern" className="block text-sm font-medium text-gray-700 mb-1">
                          Page Pattern <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="pagePattern"
                          value={formData.scope.pagePatterns?.[0] || ''}
                          onChange={(e) => handlePagePatternChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select a page...</option>
                          <option value="/:region/contact">Contact page</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Select which page this banner should appear on
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!hasChanges && !isNew}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isNew ? 'Add Banner' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

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
    </>
  );
}
