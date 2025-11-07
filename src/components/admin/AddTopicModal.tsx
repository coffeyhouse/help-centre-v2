import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useParams } from 'react-router-dom';
import IconSelector from './IconSelector';

interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  productId: string;
  parentTopicId?: string;
  showOnProductLanding?: boolean;
}

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  existingTopic?: Topic | null;
  availableParentTopics?: Topic[];
}

export default function AddTopicModal({
  isOpen,
  onClose,
  onSuccess,
  productId,
  existingTopic,
  availableParentTopics = []
}: AddTopicModalProps) {
  const { token } = useAdminAuth();
  const { region, productId: productFolderId } = useParams<{ region: string; productId: string }>();
  const isEditMode = !!existingTopic;
  const [hasParentTopic, setHasParentTopic] = useState(!!existingTopic?.parentTopicId);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    icon: '',
    parentTopicId: '',
    showOnProductLanding: true,
  });

  const [error, setError] = useState('');

  // Initialize or reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && existingTopic) {
      // Edit mode: populate with existing data
      setFormData({
        id: existingTopic.id,
        title: existingTopic.title,
        description: existingTopic.description,
        icon: existingTopic.icon || '',
        parentTopicId: existingTopic.parentTopicId || '',
        showOnProductLanding: existingTopic.showOnProductLanding !== false,
      });
      setHasParentTopic(!!existingTopic.parentTopicId);
      setError('');
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        id: '',
        title: '',
        description: '',
        icon: '',
        parentTopicId: '',
        showOnProductLanding: true,
      });
      setHasParentTopic(false);
      setError('');
    }
  }, [isOpen, existingTopic]);

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

  const generateId = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      id: isEditMode ? formData.id : generateId(title),
    });
  };

  const handleParentTopicToggle = (checked: boolean) => {
    setHasParentTopic(checked);
    if (!checked) {
      setFormData({ ...formData, parentTopicId: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Topic title is required');
      return;
    }

    if (!formData.id.trim()) {
      setError('Topic ID is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Topic description is required');
      return;
    }

    if (!formData.icon.trim()) {
      setError('Topic icon is required');
      return;
    }

    if (hasParentTopic && !formData.parentTopicId) {
      setError('Please select a parent topic');
      return;
    }

    setLoading(true);

    try {
      // Build the new or updated topic
      const topicData: Topic = {
        id: formData.id,
        title: formData.title,
        description: formData.description,
        icon: formData.icon,
        productId: productId,
        ...(formData.parentTopicId && { parentTopicId: formData.parentTopicId }),
        showOnProductLanding: formData.showOnProductLanding,
      };

      // Get all current topics
      const topicsResponse = await fetch(`/api/products/${region}/${productFolderId}/topics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!topicsResponse.ok) {
        throw new Error('Failed to load current topics');
      }

      const topicsResult = await topicsResponse.json();
      let allTopics = topicsResult.data.supportHubs || [];

      // Update or add the topic
      if (isEditMode) {
        // Replace the existing topic
        allTopics = allTopics.map((t: Topic) =>
          t.id === existingTopic.id ? topicData : t
        );
      } else {
        // Add new topic
        allTopics.push(topicData);
      }

      // Save all topics
      const saveResponse = await fetch(`/api/products/${region}/${productFolderId}/topics`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { supportHubs: allTopics } }),
      });

      if (!saveResponse.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} topic`);
      }

      // Success
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} topic`;
      setError(errorMessage);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} topic:`, err);
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
          className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Topic' : 'Add New Topic'}
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
            <div className="px-6 py-4 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Topic ID */}
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                  Topic ID *
                </label>
                <input
                  type="text"
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g., install-software"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  required
                  disabled={isEditMode}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isEditMode ? 'Topic ID cannot be changed' : 'Auto-generated from title, but can be edited'}
                </p>
              </div>

              {/* Topic Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., Install your software"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
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
                  placeholder="Brief description of this topic..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon *
                </label>
                <IconSelector
                  value={formData.icon}
                  onChange={(iconName) => setFormData({ ...formData, icon: iconName })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Select an icon for this topic</p>
              </div>

              {/* Parent Topic */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasParentTopic"
                    checked={hasParentTopic}
                    onChange={(e) => handleParentTopicToggle(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasParentTopic" className="ml-2 text-sm font-medium text-gray-700">
                    This is a subtopic
                  </label>
                </div>

                {hasParentTopic && (
                  <div>
                    <label htmlFor="parentTopicId" className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Topic *
                    </label>
                    <select
                      id="parentTopicId"
                      value={formData.parentTopicId || ''}
                      onChange={(e) => setFormData({ ...formData, parentTopicId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={hasParentTopic}
                    >
                      <option value="">Select parent topic...</option>
                      {availableParentTopics
                        .filter((t) => t.id !== formData.id)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} ({t.id})
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select the parent topic this belongs under</p>
                  </div>
                )}
              </div>

              {/* Show on Product Landing Page */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showOnProductLanding"
                  checked={formData.showOnProductLanding}
                  onChange={(e) => setFormData({ ...formData, showOnProductLanding: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showOnProductLanding" className="ml-2 text-sm text-gray-700">
                  Show on Product Landing Page
                </label>
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
                {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Add Topic')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
