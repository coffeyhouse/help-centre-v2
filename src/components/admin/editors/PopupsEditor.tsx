import { useState } from 'react';
import { PlusIcon, TrashIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../ConfirmModal';
import DraggableListItem from '../DraggableListItem';
import Modal from '../../common/Modal';
import { useDragAndDrop } from '../../../hooks/useDragAndDrop';
import { useFormChangeTracking } from '../../../hooks/useFormChangeTracking';

interface PopupButton {
  text: string;
  url?: string;
  action?: 'dismiss' | 'link';
  primary?: boolean;
}

interface Popup {
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

interface PopupsEditorProps {
  data: {
    popups: Popup[];
  };
  onChange: (data: any) => void;
}

export default function PopupsEditor({ data, onChange }: PopupsEditorProps) {
  const [selectedPopupIndex, setSelectedPopupIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [popupToDelete, setPopupToDelete] = useState<{ index: number; title: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  // Filter popups by active status if filter is enabled
  const filteredPopups = filterActive
    ? data.popups.map((p, i) => ({ ...p, originalIndex: i })).filter(p => p.active)
    : data.popups.map((p, i) => ({ ...p, originalIndex: i }));

  // Drag and drop handlers
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop: handleDropRaw,
    handleDragEnd,
  } = useDragAndDrop(data.popups, (reorderedPopups) => {
    onChange({
      ...data,
      popups: reorderedPopups,
    });
  }, (draggedIdx, dropIdx) => {
    if (selectedPopupIndex !== null) {
      if (selectedPopupIndex === draggedIdx) {
        setSelectedPopupIndex(dropIdx);
      } else if (draggedIdx < selectedPopupIndex && dropIdx >= selectedPopupIndex) {
        setSelectedPopupIndex(selectedPopupIndex - 1);
      } else if (draggedIdx > selectedPopupIndex && dropIdx <= selectedPopupIndex) {
        setSelectedPopupIndex(selectedPopupIndex + 1);
      }
    }
  });

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (filterActive) {
      const globalDropIndex = filteredPopups[dropIndex]?.originalIndex;
      const globalDraggedIndex = draggedIndex !== null ? filteredPopups[draggedIndex]?.originalIndex : null;

      if (globalDraggedIndex !== null && globalDraggedIndex !== undefined &&
          globalDropIndex !== null && globalDropIndex !== undefined) {
        const reorderedPopups = [...data.popups];
        const [movedPopup] = reorderedPopups.splice(globalDraggedIndex, 1);
        reorderedPopups.splice(globalDropIndex, 0, movedPopup);

        onChange({
          ...data,
          popups: reorderedPopups,
        });

        if (selectedPopupIndex === globalDraggedIndex) {
          setSelectedPopupIndex(globalDropIndex);
        }
      }
    } else {
      handleDropRaw(e, dropIndex);
    }
  };

  const handleSelectPopup = (index: number) => {
    setSelectedPopupIndex(index);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setSelectedPopupIndex(null);
  };

  const handleSaveNew = (popup: Popup) => {
    onChange({
      ...data,
      popups: [...data.popups, popup],
    });
    setIsAddingNew(false);
  };

  const handleUpdatePopup = (index: number, updatedPopup: Popup) => {
    onChange({
      ...data,
      popups: data.popups.map((p, i) => (i === index ? updatedPopup : p)),
    });
  };

  const handleDeletePopup = (index: number) => {
    const popup = data.popups[index];
    setPopupToDelete({ index, title: popup.title });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (popupToDelete) {
      onChange({
        ...data,
        popups: data.popups.filter((_, i) => i !== popupToDelete.index),
      });
      setSelectedPopupIndex(null);
      setPopupToDelete(null);
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setSelectedPopupIndex(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Popups List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Popup Modals ({filteredPopups.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
              Preview
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Add New
            </button>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="filterActive"
            checked={filterActive}
            onChange={(e) => setFilterActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="filterActive" className="text-sm text-gray-700">
            Show only active popups
          </label>
        </div>

        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
          {filteredPopups.map((popup, localIndex) => (
            <DraggableListItem
              key={popup.id}
              index={localIndex}
              isSelected={selectedPopupIndex === popup.originalIndex}
              isDragging={draggedIndex === localIndex}
              isDragOver={dragOverIndex === localIndex}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onClick={() => handleSelectPopup(popup.originalIndex)}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-medium text-sm text-gray-900">{popup.title}</div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span
                      className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800"
                    >
                      Priority: {popup.priority}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        popup.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {popup.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{popup.id}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Trigger: {popup.trigger.type} • Scope: {popup.scope.type}
                  {popup.countries && ` • ${popup.countries.join(', ')}`}
                </div>
              </div>
            </DraggableListItem>
          ))}
        </div>
      </div>

      {/* Right Panel - Popup Form */}
      <div>
        {(selectedPopupIndex !== null || isAddingNew) ? (
          <PopupForm
            popup={selectedPopupIndex !== null ? data.popups[selectedPopupIndex] : null}
            isNew={isAddingNew}
            onSave={
              isAddingNew
                ? handleSaveNew
                : (popup) => handleUpdatePopup(selectedPopupIndex!, popup)
            }
            onDelete={
              selectedPopupIndex !== null ? () => handleDeletePopup(selectedPopupIndex) : undefined
            }
            onCancel={handleCancel}
          />
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center h-full flex items-center justify-center">
            <p className="text-gray-600">Select a popup to edit or click "Add New" to create one</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Popup"
        message={`Are you sure you want to delete "${popupToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Popups Preview"
        maxWidth="max-w-6xl"
      >
        <PopupsPreview popups={data.popups} />
      </Modal>
    </div>
  );
}

// Preview component for popups
function PopupsPreview({ popups }: { popups: Popup[] }) {
  const activePopups = popups.filter((p) => p.active);
  const sortedPopups = [...activePopups].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Active Popups Preview</h3>
        <p className="text-sm text-gray-600">
          This shows how active popups will appear to users. Popups are sorted by priority (highest first).
        </p>
      </div>

      {sortedPopups.length > 0 ? (
        <div className="space-y-6">
          {sortedPopups.map((popup) => (
            <div
              key={popup.id}
              className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden"
            >
              {popup.image && (
                <img src={popup.image} alt="" className="w-full h-48 object-cover" />
              )}
              {popup.video && (
                <div className="w-full bg-gray-200 h-48 flex items-center justify-center">
                  <span className="text-sm text-gray-600">Video: {popup.video}</span>
                </div>
              )}
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-3">{popup.title}</h4>
                <p className="text-gray-700 mb-4 whitespace-pre-line">{popup.message}</p>
                {popup.buttons && popup.buttons.length > 0 && (
                  <div className="flex gap-3">
                    {popup.buttons.map((button, idx) => (
                      <button
                        key={idx}
                        className={`px-6 py-2 rounded-lg text-sm font-medium ${
                          button.primary
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                        onClick={(e) => e.preventDefault()}
                      >
                        {button.text}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <div>Priority: {popup.priority}</div>
                  <div>Trigger: {popup.trigger.type}
                    {popup.trigger.delay && ` (${popup.trigger.delay}ms)`}
                    {popup.trigger.scrollPercentage && ` (${popup.trigger.scrollPercentage}%)`}
                  </div>
                  <div>Scope: {popup.scope.type}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No active popups to preview
        </div>
      )}
    </div>
  );
}

// Form component for creating/editing popups
function PopupForm({
  popup,
  isNew,
  onSave,
  onDelete,
  onCancel,
}: {
  popup: Popup | null;
  isNew: boolean;
  onSave: (popup: Popup) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Popup>(
    popup || {
      id: '',
      title: '',
      message: '',
      image: '',
      video: '',
      buttons: [],
      scope: { type: 'global' },
      trigger: { type: 'immediate' },
      priority: 1,
      active: true,
      countries: [],
    }
  );

  const { hasChanges, markAsSaved } = useFormChangeTracking(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    markAsSaved();
  };

  const handleAddButton = () => {
    setFormData({
      ...formData,
      buttons: [
        ...(formData.buttons || []),
        { text: '', action: 'dismiss', primary: false },
      ],
    });
  };

  const handleUpdateButton = (index: number, button: PopupButton) => {
    const updatedButtons = [...(formData.buttons || [])];
    updatedButtons[index] = button;
    setFormData({ ...formData, buttons: updatedButtons });
  };

  const handleRemoveButton = (index: number) => {
    setFormData({
      ...formData,
      buttons: formData.buttons?.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">
          {isNew ? 'New Popup' : 'Edit Popup'}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* ID Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.id}
          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={!isNew}
        />
        <p className="text-xs text-gray-500 mt-1">Unique identifier (cannot be changed after creation)</p>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="text-sm font-medium text-gray-700">
          Active
        </label>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          min="1"
        />
        <p className="text-xs text-gray-500 mt-1">Higher number = higher priority</p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          required
        />
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="text"
          value={formData.image || ''}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="/images/banner.jpg"
        />
      </div>

      {/* Video URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video URL
        </label>
        <input
          type="text"
          value={formData.video || ''}
          onChange={(e) => setFormData({ ...formData, video: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://www.youtube.com/embed/..."
        />
      </div>

      {/* Trigger Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trigger Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.trigger.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              trigger: { ...formData.trigger, type: e.target.value as 'immediate' | 'delay' | 'scroll' },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="immediate">Immediate</option>
          <option value="delay">Delay</option>
          <option value="scroll">Scroll</option>
        </select>
      </div>

      {/* Trigger Options */}
      {formData.trigger.type === 'delay' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delay (milliseconds)
          </label>
          <input
            type="number"
            value={formData.trigger.delay || 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                trigger: { ...formData.trigger, delay: parseInt(e.target.value) || 0 },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>
      )}

      {formData.trigger.type === 'scroll' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scroll Percentage (0-100)
          </label>
          <input
            type="number"
            value={formData.trigger.scrollPercentage || 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                trigger: { ...formData.trigger, scrollPercentage: parseInt(e.target.value) || 0 },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="100"
          />
        </div>
      )}

      {/* Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Buttons
          </label>
          <button
            type="button"
            onClick={handleAddButton}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add Button
          </button>
        </div>
        <div className="space-y-3">
          {formData.buttons?.map((button, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Button {index + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveButton(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={button.text}
                  onChange={(e) => handleUpdateButton(index, { ...button, text: e.target.value })}
                  placeholder="Button text"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <select
                  value={button.action || 'dismiss'}
                  onChange={(e) =>
                    handleUpdateButton(index, { ...button, action: e.target.value as 'dismiss' | 'link' })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="dismiss">Dismiss</option>
                  <option value="link">Link</option>
                </select>
                {button.action === 'link' && (
                  <input
                    type="text"
                    value={button.url || ''}
                    onChange={(e) => handleUpdateButton(index, { ...button, url: e.target.value })}
                    placeholder="URL"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                )}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={button.primary || false}
                    onChange={(e) => handleUpdateButton(index, { ...button, primary: e.target.checked })}
                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-xs text-gray-700">Primary button</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scope Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Scope Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.scope.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              scope: { type: e.target.value as 'global' | 'product' | 'topic' | 'page' },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="global">Global (all pages)</option>
          <option value="product">Product-specific</option>
          <option value="topic">Topic-specific</option>
          <option value="page">Page-specific</option>
        </select>
      </div>

      {/* Scope Fields */}
      {formData.scope.type === 'product' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product IDs (comma-separated)
          </label>
          <input
            type="text"
            value={formData.scope.productIds?.join(', ') || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                scope: {
                  ...formData.scope,
                  productIds: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="accounting-software, payroll"
          />
        </div>
      )}

      {formData.scope.type === 'topic' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product IDs (comma-separated)
            </label>
            <input
              type="text"
              value={formData.scope.productIds?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scope: {
                    ...formData.scope,
                    productIds: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="accounting-software"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic IDs (comma-separated)
            </label>
            <input
              type="text"
              value={formData.scope.topicIds?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scope: {
                    ...formData.scope,
                    topicIds: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="banking, invoicing"
            />
          </div>
        </>
      )}

      {formData.scope.type === 'page' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Page Patterns (comma-separated)
          </label>
          <input
            type="text"
            value={formData.scope.pagePatterns?.join(', ') || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                scope: {
                  ...formData.scope,
                  pagePatterns: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="/:region/contact, /products/:productId"
          />
        </div>
      )}

      {/* Countries */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Countries (comma-separated, leave empty for all)
        </label>
        <input
          type="text"
          value={formData.countries?.join(', ') || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              countries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="gb, ie"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={!isNew && !hasChanges}
          >
            {isNew ? 'Create' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
