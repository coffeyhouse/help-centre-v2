import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { ChatBubbleLeftRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import DragDropCard, { type Badge } from '../../components/admin/DragDropCard';
import DragDropListLayout from '../../components/admin/DragDropListLayout';
import DetailPanel from '../../components/admin/DetailPanel';
import PopupFormModal, { type Popup } from '../../components/admin/PopupFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function PopupsPage() {
  const { region } = useParams<{ region: string }>();
  const { token } = useAdminAuth();
  const { regions } = useAdminRegion();
  const [popups, setPopups] = useState<Popup[]>([]);
  const [selectedPopupIndex, setSelectedPopupIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [popupToDelete, setPopupToDelete] = useState<{ index: number; title: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  usePageTitle('Pop-ups', 'Admin');

  const currentRegion = regions.find((r) => r.id === region);
  const regionName = currentRegion?.name || region;

  // Drag and drop functionality
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop: handleDropRaw,
    handleDragEnd,
  } = useDragAndDrop(popups, (reorderedPopups) => {
    setPopups(reorderedPopups);
    setHasUnsavedChanges(true);
  });

  useEffect(() => {
    loadData();
  }, [region]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/regions/${region}/popups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load popups data');
      }

      const result = await response.json();
      setPopups(result.data.popups || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading popups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch(`/api/regions/${region}/popups`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { popups } }),
      });

      if (!response.ok) {
        throw new Error('Failed to save popups data');
      }

      setSuccessMessage('Changes saved successfully');
      setHasUnsavedChanges(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      console.error('Error saving popups:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    handleDropRaw(e, dropIndex);

    // Update selected popup index after reordering
    if (selectedPopupIndex !== null && draggedIndex !== null) {
      if (selectedPopupIndex === draggedIndex) {
        setSelectedPopupIndex(dropIndex);
      } else if (draggedIndex < selectedPopupIndex && dropIndex >= selectedPopupIndex) {
        setSelectedPopupIndex(selectedPopupIndex - 1);
      } else if (draggedIndex > selectedPopupIndex && dropIndex <= selectedPopupIndex) {
        setSelectedPopupIndex(selectedPopupIndex + 1);
      }
    }
  };

  const handleSelectPopup = (index: number) => {
    // Toggle selection - if clicking the same card, unselect it
    setSelectedPopupIndex(selectedPopupIndex === index ? null : index);
  };

  const handleAddPopup = () => {
    setIsAddModalOpen(true);
  };

  const handleEditPopup = () => {
    setIsEditModalOpen(true);
  };

  const handleSavePopup = (popup: Popup) => {
    setPopups([...popups, popup]);
    setHasUnsavedChanges(true);
    setIsAddModalOpen(false);
  };

  const handleUpdatePopup = (updatedPopup: Popup) => {
    if (selectedPopupIndex !== null) {
      const newPopups = [...popups];
      newPopups[selectedPopupIndex] = updatedPopup;
      setPopups(newPopups);
      setHasUnsavedChanges(true);
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteClick = () => {
    if (selectedPopupIndex !== null) {
      setPopupToDelete({
        index: selectedPopupIndex,
        title: popups[selectedPopupIndex].title,
      });
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (popupToDelete !== null) {
      const newPopups = popups.filter((_, i) => i !== popupToDelete.index);
      setPopups(newPopups);
      setHasUnsavedChanges(true);

      if (selectedPopupIndex === popupToDelete.index) {
        setSelectedPopupIndex(null);
      } else if (selectedPopupIndex !== null && selectedPopupIndex > popupToDelete.index) {
        setSelectedPopupIndex(selectedPopupIndex - 1);
      }
      setIsEditModalOpen(false);
    }
    setPopupToDelete(null);
  };

  const getTriggerLabel = (trigger: Popup['trigger']): string => {
    if (trigger.type === 'delay') {
      return `Delay (${trigger.delay}ms)`;
    } else if (trigger.type === 'scroll') {
      return `Scroll (${trigger.scrollPercentage}%)`;
    }
    return 'Immediate';
  };

  const selectedPopup = selectedPopupIndex !== null ? popups[selectedPopupIndex] : null;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: regionName || '' },
        { label: 'Pop-ups' },
      ]}
    >
      <PageHeader
        icon={<ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-600" />}
        title="Pop-up Modals"
        description={`Manage promotional and informational pop-ups for ${regionName}`}
        badges={[
          { label: `${popups.length} ${popups.length === 1 ? 'pop-up' : 'pop-ups'}`, color: 'blue' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button
              onClick={handleAddPopup}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add Pop-up
            </button>
          </div>
        }
      />

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading pop-ups...</p>
        </div>
      ) : (
        <DragDropListLayout
          listTitle="All Pop-ups"
          itemCount={popups.length}
          listContent={popups.map((popup, index) => {
            const badges: Badge[] = [];

            // Priority badge
            badges.push({
              label: `Priority: ${popup.priority}`,
              color: 'purple',
            });

            // Trigger badge
            badges.push({
              label: getTriggerLabel(popup.trigger),
              color: 'blue',
            });

            // Active badge
            badges.push({
              label: popup.active ? 'Active' : 'Inactive',
              color: popup.active ? 'green' : 'gray',
            });

            // Scope badge
            if (popup.scope.type !== 'global') {
              badges.push({
                label: popup.scope.type,
                color: 'orange',
              });
            }

            return (
              <DragDropCard
                key={popup.id}
                icon={<ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />}
                title={popup.title}
                description={popup.message}
                badges={badges}
                isSelected={selectedPopupIndex === index}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onClick={() => handleSelectPopup(index)}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              />
            );
          })}
          detailContent={
            <DetailPanel
              icon={<ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />}
              title={selectedPopup?.title}
              description={selectedPopup?.message}
              onEdit={selectedPopup ? handleEditPopup : undefined}
              editButtonText="Edit Pop-up"
              emptyStateIcon={<ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
              emptyStateText="Select a pop-up to view details"
              actionsContent={
                selectedPopup ? (
                  <>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Pop-up Details</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">ID:</span>
                        <span className="ml-2 text-gray-600">{selectedPopup.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Priority:</span>
                        <span className="ml-2 text-gray-600">{selectedPopup.priority}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${
                          selectedPopup.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedPopup.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Trigger:</span>
                        <span className="ml-2 text-gray-600">{getTriggerLabel(selectedPopup.trigger)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Scope:</span>
                        <span className="ml-2 text-gray-600">{selectedPopup.scope.type}</span>
                      </div>
                      {selectedPopup.image && (
                        <div>
                          <span className="font-medium text-gray-700">Image:</span>
                          <div className="ml-2 mt-1">
                            <a
                              href={selectedPopup.image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm break-all"
                            >
                              {selectedPopup.image}
                            </a>
                          </div>
                        </div>
                      )}
                      {selectedPopup.video && (
                        <div>
                          <span className="font-medium text-gray-700">Video:</span>
                          <div className="ml-2 mt-1">
                            <a
                              href={selectedPopup.video}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm break-all"
                            >
                              {selectedPopup.video}
                            </a>
                          </div>
                        </div>
                      )}
                      {selectedPopup.buttons && selectedPopup.buttons.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Buttons:</span>
                          <div className="ml-2 mt-1 space-y-1">
                            {selectedPopup.buttons.map((button, idx) => (
                              <div key={idx} className="text-xs text-gray-600">
                                • {button.text} ({button.action}{button.primary ? ', primary' : ''})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedPopup.countries && selectedPopup.countries.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Countries:</span>
                          <span className="ml-2 text-gray-600">{selectedPopup.countries.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : undefined
              }
            />
          }
          emptyState={
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No pop-ups found.</p>
              <button
                onClick={handleAddPopup}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Pop-up
              </button>
            </div>
          }
        />
      )}

      {/* Add Popup Modal */}
      <PopupFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        popup={null}
        onSave={handleSavePopup}
      />

      {/* Edit Popup Modal */}
      {selectedPopup && (
        <PopupFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          popup={selectedPopup}
          onSave={handleUpdatePopup}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Pop-up"
        message={`Are you sure you want to delete "${popupToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />
    </AdminLayout>
  );
}
