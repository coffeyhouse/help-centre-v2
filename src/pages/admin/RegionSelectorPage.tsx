import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import {
  GlobeAltIcon,
  PlusIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import AddRegionModal from '../../components/admin/AddRegionModal';
import DragDropCard, { type Badge } from '../../components/admin/DragDropCard';
import DragDropListLayout from '../../components/admin/DragDropListLayout';
import DetailPanel from '../../components/admin/DetailPanel';
import PageHeader from '../../components/admin/PageHeader';

interface Region {
  id: string;
  name: string;
  countries: string[];
  countryCodes: string[];
  currency: string;
  language: string;
}

interface MenuOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

export default function RegionSelectorPage() {
  const { regions: contextRegions, selectRegion, loading, error } = useAdminRegion();
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const navigate = useNavigate();

  usePageTitle('Select Region', 'Admin');

  // Sync context regions to local state
  useEffect(() => {
    setRegions(contextRegions);
  }, [contextRegions]);

  // Drag and drop functionality
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop: handleDropRaw,
    handleDragEnd,
  } = useDragAndDrop(regions, (reorderedRegions) => {
    setRegions(reorderedRegions);
    setHasUnsavedChanges(true);
  });

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    handleDropRaw(e, dropIndex);

    // Update selected region index after reordering
    if (selectedRegionIndex !== null && draggedIndex !== null) {
      if (selectedRegionIndex === draggedIndex) {
        setSelectedRegionIndex(dropIndex);
      } else if (draggedIndex < selectedRegionIndex && dropIndex >= selectedRegionIndex) {
        setSelectedRegionIndex(selectedRegionIndex - 1);
      } else if (draggedIndex > selectedRegionIndex && dropIndex <= selectedRegionIndex) {
        setSelectedRegionIndex(selectedRegionIndex + 1);
      }
    }
  };

  const handleSelectRegion = (index: number) => {
    setSelectedRegionIndex(index);
    const region = regions[index];
    selectRegion(region.id);
  };

  const handleAddRegion = () => {
    setIsAddModalOpen(true);
  };

  const handleEditRegion = () => {
    setIsEditModalOpen(true);
  };

  const handleRegionCreated = (regionId: string) => {
    setIsAddModalOpen(false);
    // Find the newly created region and select it
    const newIndex = regions.findIndex((r) => r.id === regionId);
    if (newIndex !== -1) {
      setSelectedRegionIndex(newIndex);
      selectRegion(regionId);
    }
  };

  const handleMenuOptionClick = (path: string) => {
    navigate(path);
  };

  const selectedRegion = selectedRegionIndex !== null ? regions[selectedRegionIndex] : null;

  const getMenuOptions = (region: Region): MenuOption[] => [
    {
      id: 'products',
      title: 'Products',
      description: 'Manage products, topics, articles, videos, and training',
      icon: <CubeIcon className="w-5 h-5 text-blue-600" />,
      path: `/admin/${region.id}/products`,
      color: 'blue',
    },
    {
      id: 'incidents',
      title: 'Incidents',
      description: 'Manage group-level incident banners and alerts',
      icon: <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />,
      path: `/admin/${region.id}/incidents`,
      color: 'red',
    },
    {
      id: 'popups',
      title: 'Pop-ups',
      description: 'Manage group-level promotional and informational pop-ups',
      icon: <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600" />,
      path: `/admin/${region.id}/popups`,
      color: 'purple',
    },
    {
      id: 'config',
      title: 'Group Config',
      description: 'Manage group configuration, countries, and quick access cards',
      icon: <Cog6ToothIcon className="w-5 h-5 text-gray-600" />,
      path: `/admin/${region.id}/settings`,
      color: 'gray',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; hover: string }> = {
      blue: { bg: 'bg-blue-100', hover: 'group-hover:bg-blue-200' },
      red: { bg: 'bg-red-100', hover: 'group-hover:bg-red-200' },
      purple: { bg: 'bg-purple-100', hover: 'group-hover:bg-purple-200' },
      gray: { bg: 'bg-gray-100', hover: 'group-hover:bg-gray-200' },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <AdminLayout showRegionSelector={false}>
      <PageHeader
        icon={<GlobeAltIcon className="w-12 h-12 text-blue-600" />}
        title="Regions"
        description="Select a region to manage its content and settings. Drag to reorder regions."
        badges={[
          { label: `${regions.length} ${regions.length === 1 ? 'region' : 'regions'}`, color: 'blue' }
        ]}
        actions={
          <button
            onClick={handleAddRegion}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Region
          </button>
        }
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading regions...</p>
        </div>
      ) : (
        <DragDropListLayout
          listTitle="All Regions"
          itemCount={regions.length}
          listContent={regions.map((region, index) => {
            const badges: Badge[] = [
              { label: region.currency, color: 'blue' },
              { label: region.language, color: 'gray' },
            ];

            return (
              <DragDropCard
                key={region.id}
                icon={<GlobeAltIcon className="w-6 h-6 text-blue-600" />}
                title={region.name}
                description={region.countries.join(', ')}
                badges={badges}
                isSelected={selectedRegionIndex === index}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onClick={() => handleSelectRegion(index)}
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
              icon={<GlobeAltIcon className="w-8 h-8 text-blue-600" />}
              title={selectedRegion?.name}
              description={selectedRegion ? `${selectedRegion.countries.join(', ')} • ${selectedRegion.currency} • ${selectedRegion.language}` : undefined}
              onEdit={selectedRegion ? handleEditRegion : undefined}
              editButtonText="Edit Region"
              emptyStateIcon={<GlobeAltIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
              emptyStateText="Select a region to manage its content"
              actionsContent={
                selectedRegion ? (
                  <>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Manage Content</h4>
                    <div className="space-y-3">
                      {getMenuOptions(selectedRegion).map((option) => {
                        const colors = getColorClasses(option.color);
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleMenuOptionClick(option.path)}
                            className="w-full group bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg transition-colors ${colors.bg} ${colors.hover}`}>
                                  {option.icon}
                                </div>
                                <div>
                                  <div className="font-medium text-sm text-gray-900">{option.title}</div>
                                  <div className="text-xs text-gray-500">{option.description}</div>
                                </div>
                              </div>
                              <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : undefined
              }
            />
          }
          emptyState={
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <GlobeAltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No regions found.</p>
              <button
                onClick={handleAddRegion}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Region
              </button>
            </div>
          }
        />
      )}

      {/* Add Region Modal */}
      <AddRegionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRegionCreated={handleRegionCreated}
      />

      {/* Edit Region Modal - Placeholder for now */}
      {isEditModalOpen && selectedRegion && (
        <AddRegionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onRegionCreated={() => setIsEditModalOpen(false)}
        />
      )}
    </AdminLayout>
  );
}
