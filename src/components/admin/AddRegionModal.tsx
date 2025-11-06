import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';

interface AddRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegionCreated: (regionId: string) => void;
}

export default function AddRegionModal({ isOpen, onClose, onRegionCreated }: AddRegionModalProps) {
  const { token } = useAdminAuth();
  const { refreshRegions } = useAdminRegion();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    countries: [''],
    currency: 'GBP',
    dateFormat: 'DD/MM/YYYY',
    language: 'en-GB',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        code: '',
        countries: [''],
        currency: 'GBP',
        dateFormat: 'DD/MM/YYYY',
        language: 'en-GB',
      });
      setError('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
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

  const generateCode = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      code: generateCode(name),
    });
  };

  const handleAddCountry = () => {
    setFormData({
      ...formData,
      countries: [...formData.countries, ''],
    });
  };

  const handleRemoveCountry = (index: number) => {
    if (formData.countries.length > 1) {
      setFormData({
        ...formData,
        countries: formData.countries.filter((_, i) => i !== index),
      });
    }
  };

  const handleCountryChange = (index: number, value: string) => {
    const newCountries = [...formData.countries];
    newCountries[index] = value;
    setFormData({
      ...formData,
      countries: newCountries,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Region name is required');
      return;
    }

    if (!formData.code.trim()) {
      setError('Region code is required');
      return;
    }

    const filledCountries = formData.countries.filter((c) => c.trim());
    if (filledCountries.length === 0) {
      setError('At least one country is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/regions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          countries: filledCountries,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create region');
      }

      // Refresh regions list
      await refreshRegions();

      // Call success callback
      onRegionCreated(data.region.code);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create region';
      setError(errorMessage);
      console.error('Error creating region:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

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
          className="relative bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
                Add New Region
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Region Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Region Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., UK & Ireland"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Region Code (auto-generated) */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Region Code *
                </label>
                <input
                  type="text"
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., uk-ireland"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated from name, but can be edited</p>
              </div>

              {/* Countries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Countries *
                </label>
                <div className="space-y-2">
                  {formData.countries.map((country, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => handleCountryChange(index, e.target.value)}
                        placeholder="e.g., United Kingdom"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.countries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCountry(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove country"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddCountry}
                  className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Country
                </button>
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Language *
                </label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="en-GB">English (UK)</option>
                  <option value="en-IE">English (Ireland)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>

              {/* Date Format */}
              <div>
                <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Format *
                </label>
                <select
                  id="dateFormat"
                  value={formData.dateFormat}
                  onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Region'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
