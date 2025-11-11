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
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRegion } from '../hooks/useRegion';
import Icon from '../components/common/Icon';
import Button from '../components/common/Button';
import { HeartIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Product, ArticleResponse } from '../types';
import { fetchArticle } from '../utils/articleAPI';

export default function ProfilePage() {
  const { user, reloadUser, logout, loading: authLoading } = useAuth();
  const { region } = useRegion();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteArticles, setFavoriteArticles] = useState<ArticleResponse[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    ownedProducts: user?.ownedProducts || [],
  });

  // Redirect to home if not logged in (but wait for auth to finish loading)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/${region}`);
    }
  }, [user, authLoading, navigate, region]);

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

  // Load favorite articles
  useEffect(() => {
    const loadFavoriteArticles = async () => {
      if (!user || !region) return;

      const favoriteIds = user.favorites?.[region] || [];
      if (favoriteIds.length === 0) {
        setFavoriteArticles([]);
        return;
      }

      setLoadingFavorites(true);
      try {
        const articles = await Promise.all(
          favoriteIds.map(async (articleId) => {
            try {
              return await fetchArticle(articleId, region);
            } catch (error) {
              console.error(`Failed to load article ${articleId}:`, error);
              return null;
            }
          })
        );
        setFavoriteArticles(articles.filter((a): a is ArticleResponse => a !== null));
      } catch (error) {
        console.error('Failed to load favorite articles:', error);
      } finally {
        setLoadingFavorites(false);
      }
    };

    loadFavoriteArticles();
  }, [user, region]);

  // Reset to page 1 when favorites change
  useEffect(() => {
    setCurrentPage(1);
  }, [favoriteArticles.length]);

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

  const handleDelete = async () => {
    if (!user) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      // Account deleted successfully, log out and redirect
      logout();
      navigate(`/${region}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRemoveFavorite = async (articleId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.id}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region,
          articleId,
          action: 'remove',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove favorite');
      }

      // Reload user data and favorite articles
      await reloadUser();
      setSuccessMessage('Article removed from favorites');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove favorite');
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(favoriteArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFavorites = favoriteArticles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to the top of the favorites section after state update
    setTimeout(() => {
      const favoritesSection = document.getElementById('favorites-section');
      if (favoritesSection) {
        const yOffset = -20; // 20px offset from the top
        const y = favoritesSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 0);
  };

  const hasChanges =
    user &&
    (formData.name !== user.name ||
      JSON.stringify([...formData.ownedProducts].sort()) !==
        JSON.stringify([...user.ownedProducts].sort()));

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

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

        {/* Favorite Articles Card */}
        <div id="favorites-section" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <HeartIcon className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Favorite Articles {favoriteArticles.length > 0 && `(${favoriteArticles.length})`}
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Articles you've favorited in {region?.toUpperCase()}
          </p>

          {loadingFavorites ? (
            <div className="text-center py-8 text-gray-500">
              Loading favorite articles...
            </div>
          ) : favoriteArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <HeartIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>No favorite articles yet</p>
              <p className="text-sm mt-1">Start favoriting articles to see them here</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedFavorites.map((article) => (
                <div
                  key={article.id}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <Link
                      to={`/${region}/article/${article.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                    {article.summary && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>ID: {article.id}</span>
                      {article.viewCount > 0 && (
                        <span>{article.viewCount.toLocaleString()} views</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(article.id)}
                    className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove from favorites"
                    aria-label="Remove from favorites"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, favoriteArticles.length)} of {favoriteArticles.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
          )}
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
          <Button
            variant="secondary"
            onClick={() => navigate(`/${region}`)}
            className={saving ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className={!hasChanges || saving ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Danger Zone - Delete Account */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="alert-circle" className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Delete Account
                </h2>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Cancel
              </Button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
