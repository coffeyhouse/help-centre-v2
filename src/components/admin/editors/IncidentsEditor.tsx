import { useState } from 'react';
import { PlusIcon, TrashIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../ConfirmModal';
import DraggableListItem from '../DraggableListItem';
import Modal from '../../common/Modal';
import { useDragAndDrop } from '../../../hooks/useDragAndDrop';
import { useFormChangeTracking } from '../../../hooks/useFormChangeTracking';

interface Banner {
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

interface IncidentsEditorProps {
  data: {
    banners: Banner[];
  };
  onChange: (data: any) => void;
}

export default function IncidentsEditor({ data, onChange }: IncidentsEditorProps) {
  const [selectedBannerIndex, setSelectedBannerIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<{ index: number; title: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  // Filter banners by active status if filter is enabled
  const filteredBanners = filterActive
    ? data.banners.map((b, i) => ({ ...b, originalIndex: i })).filter(b => b.active)
    : data.banners.map((b, i) => ({ ...b, originalIndex: i }));

  // Drag and drop handlers
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop: handleDropRaw,
    handleDragEnd,
  } = useDragAndDrop(data.banners, (reorderedBanners) => {
    onChange({
      ...data,
      banners: reorderedBanners,
    });
  }, (draggedIdx, dropIdx) => {
    // Update selected index after reorder
    if (selectedBannerIndex !== null) {
      if (selectedBannerIndex === draggedIdx) {
        setSelectedBannerIndex(dropIdx);
      } else if (draggedIdx < selectedBannerIndex && dropIdx >= selectedBannerIndex) {
        setSelectedBannerIndex(selectedBannerIndex - 1);
      } else if (draggedIdx > selectedBannerIndex && dropIdx <= selectedBannerIndex) {
        setSelectedBannerIndex(selectedBannerIndex + 1);
      }
    }
  });

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    // When filtering, we need to map the local index to the global index
    if (filterActive) {
      const globalDropIndex = filteredBanners[dropIndex]?.originalIndex;
      const globalDraggedIndex = draggedIndex !== null ? filteredBanners[draggedIndex]?.originalIndex : null;

      if (globalDraggedIndex !== null && globalDraggedIndex !== undefined &&
          globalDropIndex !== null && globalDropIndex !== undefined) {
        const reorderedBanners = [...data.banners];
        const [movedBanner] = reorderedBanners.splice(globalDraggedIndex, 1);
        reorderedBanners.splice(globalDropIndex, 0, movedBanner);

        onChange({
          ...data,
          banners: reorderedBanners,
        });

        // Update selected index
        if (selectedBannerIndex === globalDraggedIndex) {
          setSelectedBannerIndex(globalDropIndex);
        }
      }
    } else {
      handleDropRaw(e, dropIndex);
    }
  };

  const handleSelectBanner = (index: number) => {
    setSelectedBannerIndex(index);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setSelectedBannerIndex(null);
  };

  const handleSaveNew = (banner: Banner) => {
    onChange({
      ...data,
      banners: [...data.banners, banner],
    });
    setIsAddingNew(false);
  };

  const handleUpdateBanner = (index: number, updatedBanner: Banner) => {
    onChange({
      ...data,
      banners: data.banners.map((b, i) => (i === index ? updatedBanner : b)),
    });
  };

  const handleDeleteBanner = (index: number) => {
    const banner = data.banners[index];
    setBannerToDelete({ index, title: banner.title });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (bannerToDelete) {
      onChange({
        ...data,
        banners: data.banners.filter((_, i) => i !== bannerToDelete.index),
      });
      setSelectedBannerIndex(null);
      setBannerToDelete(null);
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setSelectedBannerIndex(null);
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'caution':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Banners List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Incident Banners ({filteredBanners.length})
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
            Show only active banners
          </label>
        </div>

        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
          {filteredBanners.map((banner, localIndex) => (
            <DraggableListItem
              key={banner.id}
              index={localIndex}
              isSelected={selectedBannerIndex === banner.originalIndex}
              isDragging={draggedIndex === localIndex}
              isDragOver={dragOverIndex === localIndex}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onClick={() => handleSelectBanner(banner.originalIndex)}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-medium text-sm text-gray-900">{banner.title}</div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${getStateColor(
                        banner.state
                      )}`}
                    >
                      {banner.state}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        banner.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{banner.id}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Scope: {banner.scope.type}
                  {banner.countries && ` • ${banner.countries.join(', ')}`}
                </div>
              </div>
            </DraggableListItem>
          ))}
        </div>
      </div>

      {/* Right Panel - Banner Form */}
      <div>
        {(selectedBannerIndex !== null || isAddingNew) ? (
          <BannerForm
            banner={selectedBannerIndex !== null ? data.banners[selectedBannerIndex] : null}
            isNew={isAddingNew}
            onSave={
              isAddingNew
                ? handleSaveNew
                : (banner) => handleUpdateBanner(selectedBannerIndex!, banner)
            }
            onDelete={
              selectedBannerIndex !== null ? () => handleDeleteBanner(selectedBannerIndex) : undefined
            }
            onCancel={handleCancel}
          />
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center h-full flex items-center justify-center">
            <p className="text-gray-600">Select a banner to edit or click "Add New" to create one</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete "${bannerToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Banners Preview"
        maxWidth="max-w-4xl"
      >
        <BannersPreview banners={data.banners} />
      </Modal>
    </div>
  );
}

// Preview component for banners
function BannersPreview({ banners }: { banners: Banner[] }) {
  const activeBanners = banners.filter((b) => b.active);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'caution':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'resolved':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Active Banners Preview</h3>
        <p className="text-sm text-gray-600">
          This shows how active banners will appear to users. Only banners marked as "Active" are shown.
        </p>
      </div>

      {activeBanners.length > 0 ? (
        <div className="space-y-4">
          {activeBanners.map((banner) => (
            <div
              key={banner.id}
              className={`p-4 rounded-lg border ${getStateColor(banner.state)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">{banner.title}</div>
                  <div className="text-sm mb-2">{banner.message}</div>
                  {banner.link && (
                    <a
                      href={banner.link.url}
                      className="text-sm font-medium underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {banner.link.text}
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <span className="px-2 py-0.5 bg-white rounded border font-medium">
                    {banner.state}
                  </span>
                  <span className="text-xs opacity-75">
                    {banner.scope.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No active banners to display.</p>
          <p className="text-sm text-gray-400 mt-2">
            Banners need to be marked as "Active" to appear here.
          </p>
        </div>
      )}
    </div>
  );
}

interface BannerFormProps {
  banner: Banner | null;
  isNew: boolean;
  onSave: (banner: Banner) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

function BannerForm({ banner, isNew, onSave, onDelete, onCancel }: BannerFormProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [hasLink, setHasLink] = useState(!!banner?.link);

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
    onCancel();
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onCancel();
  };

  if (!formData) return null;

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 pb-4">
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

        <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
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
            {isNew ? 'Add Banner' : 'Apply Changes'}
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
