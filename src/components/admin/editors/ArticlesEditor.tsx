import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../ConfirmModal';
import DraggableListItem from '../DraggableListItem';
import { useDragAndDrop } from '../../../hooks/useDragAndDrop';

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

interface ArticlesEditorProps {
  productId: string;
  topicId: string;
  articles: Article[];
  onChange: (articles: Article[]) => void;
  topicsData?: Topic[];
  countryCodes?: string[];
}

export default function ArticlesEditor({ productId, topicId, articles, onChange, topicsData, countryCodes = ['gb', 'ie'] }: ArticlesEditorProps) {
  const [selectedArticleIndex, setSelectedArticleIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<{ index: number; title: string } | null>(null);

  const currentArticles = articles || [];

  // Drag and drop handlers
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop: handleDropRaw,
    handleDragEnd,
  } = useDragAndDrop(currentArticles, (reorderedArticles) => {
    onChange(reorderedArticles);
  });

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (selectedArticleIndex !== null && draggedIndex !== null) {
      handleDropRaw(e, dropIndex);
      if (selectedArticleIndex === draggedIndex) {
        setTimeout(() => setSelectedArticleIndex(dropIndex), 0);
      }
    } else {
      handleDropRaw(e, dropIndex);
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setSelectedArticleIndex(null);
  };

  const handleSelectArticle = (index: number) => {
    setSelectedArticleIndex(index);
    setIsAddingNew(false);
  };

  const handleDeleteClick = (index: number) => {
    setArticleToDelete({ index, title: currentArticles[index].title });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (articleToDelete !== null) {
      const newArticles = currentArticles.filter((_, i) => i !== articleToDelete.index);
      onChange(newArticles);

      if (selectedArticleIndex === articleToDelete.index) {
        setSelectedArticleIndex(null);
      } else if (selectedArticleIndex !== null && selectedArticleIndex > articleToDelete.index) {
        setSelectedArticleIndex(selectedArticleIndex - 1);
      }
    }
    setArticleToDelete(null);
  };

  const handleSaveNew = (article: Article) => {
    onChange([...currentArticles, article]);
    setSelectedArticleIndex(currentArticles.length);
    setIsAddingNew(false);
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    if (selectedArticleIndex !== null) {
      const newArticles = [...currentArticles];
      newArticles[selectedArticleIndex] = updatedArticle;
      onChange(newArticles);
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setSelectedArticleIndex(null);
  };

  const selectedArticle = selectedArticleIndex !== null ? currentArticles[selectedArticleIndex] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Left Panel - Articles List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Articles ({currentArticles.length})
          </h3>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add New
          </button>
        </div>

        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {currentArticles.map((article, index) => (
            <DraggableListItem
              key={index}
              index={index}
              isSelected={selectedArticleIndex === index}
              isDragging={draggedIndex === index}
              isDragOver={dragOverIndex === index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onClick={() => handleSelectArticle(index)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900">{article.title}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-gray-500">{article.id}</span>
                  {article.type && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      article.type === 'subtopic'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {article.type}
                    </span>
                  )}
                  {article.countries && article.countries.length > 0 && (
                    article.countries.map((country) => (
                      <span
                        key={country}
                        className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase"
                      >
                        {country}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </DraggableListItem>
          ))}
        </div>
      </div>

      {/* Right Panel - Article Form */}
      <div className="space-y-4">
        {isAddingNew ? (
          <ArticleForm
            article={null}
            onSave={handleSaveNew}
            onCancel={handleCancel}
            topicsData={topicsData}
            countryCodes={countryCodes}
            isNew
          />
        ) : selectedArticle ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Article</h3>
              <button
                onClick={() => handleDeleteClick(selectedArticleIndex!)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
            <ArticleForm
              article={selectedArticle}
              onSave={handleUpdateArticle}
              onCancel={handleCancel}
              topicsData={topicsData}
              countryCodes={countryCodes}
            />
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center h-full flex items-center justify-center">
            <p className="text-gray-600">Select an article to edit or add a new one</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Article"
        message={`Are you sure you want to delete "${articleToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />
    </div>
  );
}

interface ArticleFormProps {
  article: Article | null;
  onSave: (article: Article) => void;
  onCancel: () => void;
  isNew?: boolean;
  topicsData?: Topic[];
  countryCodes?: string[];
}

function ArticleForm({ article, onSave, onCancel, isNew, topicsData, countryCodes = ['gb', 'ie'] }: ArticleFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For subtopics without override, remove title/description
    const dataToSave = { ...formData };
    if (formData.type === 'subtopic' && !overrideSubtopic) {
      delete dataToSave.title;
      delete dataToSave.description;
    }

    onSave(dataToSave);
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
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isNew ? 'Add Article' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
