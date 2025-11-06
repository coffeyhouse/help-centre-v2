import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { GlobeAltIcon, PlusIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import AddRegionModal from '../../components/admin/AddRegionModal';

export default function RegionSelectorPage() {
  const { regions, selectRegion, loading, error } = useAdminRegion();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  usePageTitle('Select Region', 'Admin');

  const handleSelectRegion = (regionId: string) => {
    selectRegion(regionId);
    navigate(`/admin/${regionId}/menu`);
  };

  const handleAddRegion = () => {
    setIsAddModalOpen(true);
  };

  const handleRegionCreated = (regionId: string) => {
    setIsAddModalOpen(false);
    // Navigate to the new region's menu
    selectRegion(regionId);
    navigate(`/admin/${regionId}/menu`);
  };

  return (
    <AdminLayout showRegionSelector={false} maxWidth="4xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <GlobeAltIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Select a Region</h1>
        <p className="text-gray-600">
          Choose a region to manage its content, or create a new one
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading regions...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
          {error}
        </div>
      ) : (
        <>
          {/* Regions Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => handleSelectRegion(region.id)}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all text-left group border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                    <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                      {region.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {region.countries.join(', ')}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Currency:</span>
                        <span>{region.currency}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Language:</span>
                        <span>{region.language}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Add New Region Card */}
            <button
              onClick={handleAddRegion}
              className="bg-gray-50 border-2 border-dashed border-gray-300 p-6 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
            >
              <div className="flex flex-col items-center justify-center h-full min-h-[120px]">
                <div className="bg-gray-200 p-3 rounded-lg mb-3 group-hover:bg-blue-100 transition-colors">
                  <PlusIcon className="h-6 w-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  Add New Region
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Create a new administrative region
                </p>
              </div>
            </button>
          </div>

          {regions.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No regions found.</p>
              <button
                onClick={handleAddRegion}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Create Your First Region
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Region Modal */}
      <AddRegionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRegionCreated={handleRegionCreated}
      />
    </AdminLayout>
  );
}
