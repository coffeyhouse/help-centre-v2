import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../ConfirmModal';

interface SupportHub {
  id: string;
  title: string;
  description: string;
  icon: string;
  productId: string;
  parentTopicId?: string;
  showOnProductLanding?: boolean;
}

interface TopicsEditorProps {
  data: {
    supportHubs: SupportHub[];
  };
  onChange: (data: any) => void;
}

export default function TopicsEditor({ data, onChange }: TopicsEditorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<{ index: number; title: string } | null>(null);

  // Group topics by product for easier viewing
  const topicsByProduct = data.supportHubs.reduce((acc: any, topic, index) => {
    if (!acc[topic.productId]) {
      acc[topic.productId] = [];
    }
    acc[topic.productId].push({ ...topic, originalIndex: index });
    return acc;
  }, {});

  const products = Object.keys(topicsByProduct).sort();

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setSelectedTopicIndex(null);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setSelectedTopicIndex(null);
  };

  const handleSelectTopic = (index: number) => {
    setSelectedTopicIndex(index);
    setIsAddingNew(false);
  };

  const handleSaveNew = (topic: SupportHub) => {
    const updated = { ...data };
    updated.supportHubs.push(topic);
    onChange(updated);
    setIsAddingNew(false);
  };

  const handleUpdateTopic = (index: number, updatedTopic: SupportHub) => {
    const updated = { ...data };
    updated.supportHubs[index] = updatedTopic;
    onChange(updated);
  };

  const handleDeleteTopic = (index: number) => {
    const topic = data.supportHubs[index];
    setTopicToDelete({ index, title: topic.title });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (topicToDelete) {
      const updated = { ...data };
      updated.supportHubs.splice(topicToDelete.index, 1);
      onChange(updated);
      setSelectedTopicIndex(null);
      setTopicToDelete(null);
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setSelectedTopicIndex(null);
  };

  const currentProductTopics = selectedProductId ? topicsByProduct[selectedProductId] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Product Selector */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Products</h3>
        <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto">
          {products.map((productId) => {
            const topicCount = topicsByProduct[productId].length;
            return (
              <button
                key={productId}
                onClick={() => handleSelectProduct(productId)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedProductId === productId
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-gray-900 capitalize">
                      {productId.replace(/-/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle Panel - Topics List */}
      <div className="space-y-4">
        {selectedProductId ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Topics ({currentProductTopics.length})
              </h3>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add New
              </button>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto">
              {currentProductTopics.map((topic: any) => (
                <button
                  key={topic.originalIndex}
                  onClick={() => handleSelectTopic(topic.originalIndex)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTopicIndex === topic.originalIndex
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{topic.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{topic.id}</div>
                      {topic.parentTopicId && (
                        <div className="text-xs text-gray-400 mt-1">
                          ↳ Child of: {topic.parentTopicId}
                        </div>
                      )}
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center h-full flex items-center justify-center">
            <p className="text-gray-600">Select a product to view its topics</p>
          </div>
        )}
      </div>

      {/* Right Panel - Topic Form */}
      <div>
        {(selectedTopicIndex !== null || isAddingNew) ? (
          <TopicForm
            topic={selectedTopicIndex !== null ? data.supportHubs[selectedTopicIndex] : null}
            isNew={isAddingNew}
            defaultProductId={selectedProductId || ''}
            availableParentTopics={currentProductTopics}
            onSave={
              isAddingNew
                ? handleSaveNew
                : (topic) => handleUpdateTopic(selectedTopicIndex!, topic)
            }
            onDelete={
              selectedTopicIndex !== null ? () => handleDeleteTopic(selectedTopicIndex) : undefined
            }
            onCancel={handleCancel}
          />
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center h-full flex items-center justify-center">
            <p className="text-gray-600">
              {selectedProductId
                ? 'Select a topic to edit or click "Add New" to create one'
                : 'Select a product first'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Topic"
        message={`Are you sure you want to delete "${topicToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />
    </div>
  );
}

interface TopicFormProps {
  topic: SupportHub | null;
  isNew: boolean;
  defaultProductId: string;
  availableParentTopics: any[];
  onSave: (topic: SupportHub) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

function TopicForm({ topic, isNew, defaultProductId, availableParentTopics, onSave, onDelete, onCancel }: TopicFormProps) {
  const [formData, setFormData] = useState<SupportHub>(
    topic || {
      id: '',
      title: '',
      description: '',
      icon: '',
      productId: defaultProductId,
      parentTopicId: '',
      showOnProductLanding: true,
    }
  );

  const [hasParentTopic, setHasParentTopic] = useState(false);

  // Update form data when topic prop changes
  useEffect(() => {
    if (topic) {
      setFormData(topic);
      setHasParentTopic(!!topic.parentTopicId);
    } else {
      setFormData({
        id: '',
        title: '',
        description: '',
        icon: '',
        productId: defaultProductId,
        parentTopicId: '',
        showOnProductLanding: true,
      });
      setHasParentTopic(false);
    }
  }, [topic, defaultProductId]);

  const handleChange = (field: keyof SupportHub, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleParentTopicToggle = (checked: boolean) => {
    setHasParentTopic(checked);
    if (!checked) {
      setFormData((prev) => ({ ...prev, parentTopicId: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Remove optional fields if empty
    const cleaned: any = { ...formData };
    if (!cleaned.parentTopicId) delete cleaned.parentTopicId;
    if (cleaned.showOnProductLanding === undefined || cleaned.showOnProductLanding === true) {
      delete cleaned.showOnProductLanding;
    }

    onSave(cleaned);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isNew ? 'New Topic' : 'Edit Topic'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

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
          placeholder="e.g., install-software"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {isNew ? 'Unique identifier (use lowercase with hyphens)' : 'ID cannot be changed after creation'}
        </p>
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
          placeholder="e.g., Install your software"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief description of this topic..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => handleChange('icon', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., download, bank, calendar"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Icon name for UI display</p>
      </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Topic <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.parentTopicId || ''}
              onChange={(e) => handleChange('parentTopicId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={hasParentTopic}
            >
              <option value="">Select parent topic...</option>
              {availableParentTopics
                .filter((t: any) => t.id !== formData.id) // Don't allow selecting itself
                .map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.id})
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Select the parent topic this belongs under</p>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="showOnProductLanding"
          checked={formData.showOnProductLanding !== false}
          onChange={(e) => handleChange('showOnProductLanding', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="showOnProductLanding" className="ml-2 text-sm text-gray-700">
          Show on Product Landing Page
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isNew ? 'Create Topic' : 'Save Changes'}
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
  );
}

