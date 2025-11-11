import { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useFormChangeTracking } from '../../hooks/useFormChangeTracking';
import ConfirmModal from './ConfirmModal';

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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [hasLink, setHasLink] = useState(!!banner?.link);

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
      setFormData({
        ...formData,
        scope: { ...formData.scope, [field]: value },
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {isNew ? 'New Banner' : 'Edit Banner'}
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => handleChange('id', e.target.value)}
                  disabled={!isNew}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isNew ? 'bg-gray-100 cursor-not-allowed' : ''
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value as Banner['state'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Scheduled Maintenance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link Text <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.link.text}
                        onChange={(e) => handleLinkChange('text', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Learn more"
                        required={hasLink}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.link.url}
                        onChange={(e) => handleLinkChange('url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://..."
                        required={hasLink}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Scope Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.scope.type}
                  onChange={(e) => handleScopeChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="global">Global</option>
                  <option value="product">Product</option>
                  <option value="page">Page</option>
                  <option value="topic">Topic</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Where this banner should be displayed
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!hasChanges && !isNew}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isNew ? 'Add Banner' : 'Save Changes'}
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>
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
