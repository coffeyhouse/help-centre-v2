import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import PopupsEditor from '../../components/admin/editors/PopupsEditor';

export default function PopupsPage() {
  const { region } = useParams<{ region: string }>();
  const { token } = useAdminAuth();
  const { regions } = useAdminRegion();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  usePageTitle('Pop-ups', 'Admin');

  const currentRegion = regions.find((r) => r.id === region);
  const regionName = currentRegion?.name || region;

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
      setData(result.data);
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
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error('Failed to save popups data');
      }

      setSuccessMessage('Changes saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      console.error('Error saving popups:', err);
    } finally {
      setSaving(false);
    }
  };

  const popupCount = data?.popups?.length || 0;

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
          { label: `${popupCount} ${popupCount === 1 ? 'pop-up' : 'pop-ups'}`, color: 'blue' }
        ]}
        actions={
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
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
      ) : data ? (
        <div className="bg-white rounded-lg shadow">
          <PopupsEditor data={data} onChange={setData} />
        </div>
      ) : null}
    </AdminLayout>
  );
}
