/**
 * FavoriteButton - Button to favorite/unfavorite articles
 *
 * Features:
 * - Shows heart icon (outlined when not favorited, filled when favorited)
 * - Disabled when user is not logged in with tooltip
 * - Updates favorites via API
 * - Shows toast notification on success/error
 */

import { useState } from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import { useRegion } from '../../hooks/useRegion';
import Toast from './Toast';

export interface FavoriteButtonProps {
  articleId: string;
}

export default function FavoriteButton({ articleId }: FavoriteButtonProps) {
  const { user, reloadUser } = useAuth();
  const { region } = useRegion();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Check if article is favorited
  const isFavorited = user?.favorites?.[region]?.includes(articleId) ?? false;

  const handleToggleFavorite = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${user.id}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region,
          articleId,
          action: isFavorited ? 'remove' : 'add',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update favorite');
      }

      // Reload user data to get updated favorites
      await reloadUser();

      // Show success toast
      setToast({
        message: isFavorited
          ? 'Article removed from favorites'
          : 'Article added to favorites',
        type: 'success',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to update favorite',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isFavorited ? HeartSolid : HeartOutline;
  const buttonColor = isFavorited ? 'text-red-600' : 'text-gray-400';
  const hoverColor = user ? (isFavorited ? 'hover:text-red-700' : 'hover:text-red-600') : '';

  return (
    <>
      <button
        onClick={handleToggleFavorite}
        disabled={!user || isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
          !user
            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
            : `border-gray-300 ${buttonColor} ${hoverColor}`
        } transition-colors disabled:opacity-50`}
        title={!user ? 'Log in to favorite this article' : isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">
          {isLoading ? 'Saving...' : isFavorited ? 'Favorited' : 'Favorite'}
        </span>
      </button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
