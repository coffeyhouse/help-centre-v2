import { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useFormChangeTracking } from '../../hooks/useFormChangeTracking';
import ConfirmModal from './ConfirmModal';

interface PopupButton {
  text: string;
  url?: string;
  action?: 'dismiss' | 'link';
  primary?: boolean;
}

export interface Popup {
  id: string;
  title: string;
  message: string;
  image?: string;
  video?: string;
  buttons?: PopupButton[];
  scope: {
    type: 'global' | 'product' | 'page' | 'topic';
    productIds?: string[];
    pagePatterns?: string[];
    topicIds?: string[];
  };
  trigger: {
    type: 'immediate' | 'delay' | 'scroll';
    delay?: number;
    scrollPercentage?: number;
  };
  priority: number;
  active: boolean;
  countries?: string[];
}

interface PopupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  popup: Popup | null;
  onSave: (popup: Popup) => void;
  onDelete?: () => void;
}

export default function PopupFormModal({
  isOpen,
  onClose,
  popup,
  onSave,
  onDelete,
}: PopupFormModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isNew = !popup;

  // Use the change tracking hook
  const { formData, setFormData, hasChanges } = useFormChangeTracking<Popup>(
    popup || {
      id: '',
      title: '',
      message: '',
      scope: { type: 'global' },
      trigger: { type: 'immediate' },
      priority: 0,
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

  const handleChange = (field: keyof Popup, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
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

  const handleTriggerChange = (field: string, value: any) => {
    if (formData) {
      setFormData({
        ...formData,
        trigger: { ...formData.trigger, [field]: value },
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
                {isNew ? 'New Pop-up' : 'Edit Pop-up'}
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
                  placeholder="e.g., promo-summer-2025"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isNew ? 'Unique identifier (use lowercase with hyphens)' : 'ID cannot be changed after creation'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher priority shows first</p>
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
                  placeholder="e.g., Summer Sale - 30% Off"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => handleChange('image', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.video || ''}
                    onChange={(e) => handleChange('video', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Trigger Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trigger Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.trigger.type}
                  onChange={(e) => handleTriggerChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="immediate">Immediate</option>
                  <option value="delay">Delay</option>
                  <option value="scroll">Scroll</option>
                </select>

                {formData.trigger.type === 'delay' && (
                  <input
                    type="number"
                    value={formData.trigger.delay || 0}
                    onChange={(e) => handleTriggerChange('delay', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                    placeholder="Delay in milliseconds"
                    min="0"
                  />
                )}

                {formData.trigger.type === 'scroll' && (
                  <input
                    type="number"
                    value={formData.trigger.scrollPercentage || 0}
                    onChange={(e) => handleTriggerChange('scrollPercentage', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                    placeholder="Scroll percentage (0-100)"
                    min="0"
                    max="100"
                  />
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
                  Where this pop-up should be displayed
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
                {isNew ? 'Add Pop-up' : 'Save Changes'}
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
