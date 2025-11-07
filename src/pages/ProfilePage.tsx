/**
 * ProfilePage - User profile management page
 *
 * Features:
 * - View and edit user information (name)
 * - Select/deselect owned products
 * - Save changes to the backend
 * - Requires authentication
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRegion } from '../hooks/useRegion';
import Icon from '../components/common/Icon';
import type { Product } from '../types';

export default function ProfilePage() {
  const { user, reloadUser } = useAuth();
  const { region } = useRegion();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    ownedProducts: user?.ownedProducts || [],
  });

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      navigate(`/${region}`);
    }
  }, [user, navigate, region]);

  // Load available products
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/public/data/${region}/products`);
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to load products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (region) {
      loadProducts();
    }
  }, [region]);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        ownedProducts: user.ownedProducts,
      });
    }
  }, [user]);

  const handleProductToggle = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      ownedProducts: prev.ownedProducts.includes(productId)
        ? prev.ownedProducts.filter((id) => id !== productId)
        : [...prev.ownedProducts, productId],
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Name cannot be empty');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccessMessage('Profile updated successfully!');

      // Reload the user data in the auth context
      await reloadUser();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    user &&
    (formData.name !== user.name ||
      JSON.stringify([...formData.ownedProducts].sort()) !==
        JSON.stringify([...user.ownedProducts].sort()));

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and products</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Account Information
          </h2>

          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={saving}
              />
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={user.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Persona Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 capitalize">
                {user.persona}
              </div>
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            My Products
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Select the products you own to personalize your experience
          </p>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products available
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.ownedProducts.includes(product.id)}
                    onChange={() => handleProductToggle(product.id)}
                    className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    disabled={saving}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon name={product.icon} className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {product.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-800">
            <Icon name="alert-circle" className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-green-800">
            <Icon name="check-circle" className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/${region}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
