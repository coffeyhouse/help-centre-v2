/**
 * ArticleFormModal - Modal for adding and editing articles
 */

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Article {
  id: string;
  title?: string;
  description?: string;
  type?: 'article' | 'subtopic';
  countries?: string[];
}

interface Topic {
  id: string;
  title: string;
  description: string;
}

interface ArticleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: Article) => void;
  article?: Article | null;
  isNew?: boolean;
  topicsData?: Topic[];
  countryCodes?: string[];
}

export default function ArticleFormModal({
  isOpen,
  onClose,
  onSave,
  article,
  isNew = false,
  topicsData = [],
  countryCodes = ['gb', 'ie'],
}: ArticleFormModalProps) {
  const [formData, setFormData] = useState<Article>(
    article || {
      id: '',
      title: '',
      description: '',
      type: 'article',
      countries: [],
    }
  );
  const [overrideSubtopic, setOverrideSubtopic] = useState(false);

  // Handle ESC key press and body overflow
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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

  // Update form data when article changes
  useEffect(() => {
    if (article) {
      setFormData(article);
      // Check if subtopic has explicit title/description (override is enabled)
      setOverrideSubtopic(
        article.type === 'subtopic' && !!(article.title || article.description)
      );
    } else if (!isNew) {
      setFormData({
        id: '',
        title: '',
        description: '',
        type: 'article',
        countries: [],
      });
      setOverrideSubtopic(false);
    }
  }, [article, isNew]);

  // Find referenced topic for subtopics
  const referencedTopic = formData.type === 'subtopic' && formData.id && topicsData
    ? topicsData.find((t) => t.id === formData.id)
    : null;

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For subtopics without override, remove title/description
    const dataToSave = { ...formData };
    if (formData.type === 'subtopic' && !overrideSubtopic) {
      delete dataToSave.title;
      delete dataToSave.description;
    }

    onSave(dataToSave);
    onClose();
  };

  const handleCountryToggle = (country: string) => {
    const countries = formData.countries || [];
    if (countries.includes(country)) {
      setFormData({ ...formData, countries: countries.filter((c) => c !== country) });
    } else {
      setFormData({ ...formData, countries: [...countries, country] });
    }
  };

  const handleOverrideToggle = () => {
    const newOverride = !overrideSubtopic;
    setOverrideSubtopic(newOverride);

    // If disabling override, clear title and description
    if (!newOverride) {
      setFormData({
        ...formData,
        title: '',
        description: '',
      });
    }
  };

  const handleTypeChange = (newType: 'article' | 'subtopic') => {
    setFormData({ ...formData, type: newType });

    // When changing to subtopic, disable override by default
    if (newType === 'subtopic') {
      setOverrideSubtopic(false);
    }
  };

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
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
            <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
              {isNew ? 'Add New Article' : 'Edit Article'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
              {/* ID */}
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                  ID *
                </label>
                <input
                  type="text"
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., install-guide"
                  required
                  disabled={!isNew}
                />
                {!isNew && (
                  <p className="text-xs text-gray-500 mt-1">ID cannot be changed after creation</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={formData.type || 'article'}
                  onChange={(e) => handleTypeChange(e.target.value as 'article' | 'subtopic')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="article">Article</option>
                  <option value="subtopic">Subtopic</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Subtopics act as navigation links to child topics
                </p>
              </div>

              {/* Override Checkbox for Subtopics */}
              {formData.type === 'subtopic' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideSubtopic}
                      onChange={handleOverrideToggle}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Override title and description
                    </span>
                  </label>
                  <p className="text-xs text-gray-600 mt-1 ml-6">
                    By default, subtopics use the title and description from the referenced topic
                  </p>
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title {formData.type !== 'subtopic' || overrideSubtopic ? '*' : ''}
                </label>
                <input
                  type="text"
                  id="title"
                  value={
                    formData.type === 'subtopic' && !overrideSubtopic && referencedTopic
                      ? referencedTopic.title
                      : formData.title || ''
                  }
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                  placeholder="e.g., Install your software"
                  required={formData.type !== 'subtopic' || overrideSubtopic}
                  disabled={formData.type === 'subtopic' && !overrideSubtopic}
                />
                {formData.type === 'subtopic' && !overrideSubtopic && (
                  <p className="text-xs text-gray-500 mt-1">
                    {referencedTopic
                      ? 'Showing title from referenced topic'
                      : 'No topic found with this ID'}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description {formData.type !== 'subtopic' || overrideSubtopic ? '*' : ''}
                </label>
                <textarea
                  id="description"
                  value={
                    formData.type === 'subtopic' && !overrideSubtopic && referencedTopic
                      ? referencedTopic.description
                      : formData.description || ''
                  }
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                  placeholder="Brief description of the article"
                  required={formData.type !== 'subtopic' || overrideSubtopic}
                  disabled={formData.type === 'subtopic' && !overrideSubtopic}
                />
                {formData.type === 'subtopic' && !overrideSubtopic && (
                  <p className="text-xs text-gray-500 mt-1">
                    {referencedTopic
                      ? 'Showing description from referenced topic'
                      : 'No topic found with this ID'}
                  </p>
                )}
              </div>

              {/* Countries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Countries (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {countryCodes.map((country) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => handleCountryToggle(country)}
                      className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                        (formData.countries || []).includes(country)
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {country.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to show in all countries
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isNew ? 'Add Article' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
