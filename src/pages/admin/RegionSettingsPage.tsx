import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import AdminLayout from '../../components/admin/AdminLayout';
import JSONEditor from '../../components/admin/editors/JSONEditor';

export default function RegionSettingsPage() {
  const { region } = useParams<{ region: string }>();
  const { token } = useAdminAuth();
  const { regions } = useAdminRegion();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const currentRegion = regions.find((r) => r.id === region);
  const regionName = currentRegion?.name || region;

  useEffect(() => {
    loadData();
  }, [region]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/files/regions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load regions data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading regions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch('/api/files/regions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error('Failed to save regions data');
      }

      setSuccessMessage('Changes saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      console.error('Error saving regions:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      breadcrumbs={[
        { label: regionName || '', path: `/admin/${region}/menu` },
        { label: 'Region Settings' },
      ]}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Region Settings</h1>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <p className="text-gray-600">
          Manage region configuration and settings
        </p>
      </div>

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
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      ) : data ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            <strong>Note:</strong> This page manages the global regions configuration. Changes here affect all regions.
          </div>
          <JSONEditor data={data} onChange={setData} />
        </div>
      ) : null}
    </AdminLayout>
  );
}
