/**
 * Custom hook for loading data with loading and error states
 * Provides a consistent interface for data fetching throughout the application
 */

import { useState, useEffect } from 'react';
import type { UseDataResult } from '../types';

/**
 * Hook for loading data with loading and error state management
 *
 * @param loader - Async function that loads the data
 * @param dependencies - Array of dependencies that trigger a reload when changed
 * @returns Object containing data, loading state, and error state
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useData(
 *   () => loadProducts('gb'),
 *   ['gb']
 * );
 *
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * return <div>{data.products.length} products</div>;
 * ```
 */
export function useData<T>(
  loader: () => Promise<T>,
  dependencies: unknown[] = []
): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await loader();

        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading data';
          setError(errorMessage);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}

/**
 * Hook for loading data with caching support
 * Caches data in memory to avoid redundant fetches
 *
 * @param cacheKey - Unique key for caching the data
 * @param loader - Async function that loads the data
 * @param dependencies - Array of dependencies that trigger a reload when changed
 * @returns Object containing data, loading state, and error state
 */
const dataCache = new Map<string, unknown>();

export function useCachedData<T>(
  cacheKey: string,
  loader: () => Promise<T>,
  dependencies: unknown[] = []
): UseDataResult<T> {
  const [data, setData] = useState<T | null>(() => {
    // Check if data exists in cache
    return (dataCache.get(cacheKey) as T) || null;
  });
  const [loading, setLoading] = useState<boolean>(!dataCache.has(cacheKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      // If data is already cached, don't fetch again
      if (dataCache.has(cacheKey)) {
        const cachedData = dataCache.get(cacheKey) as T;
        if (isMounted) {
          setData(cachedData);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await loader();

        if (isMounted) {
          setData(result);
          setError(null);
          // Cache the result
          dataCache.set(cacheKey, result);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading data';
          setError(errorMessage);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [cacheKey, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}

/**
 * Clear the data cache
 * Useful for force-reloading data or when switching regions
 */
export function clearDataCache(): void {
  dataCache.clear();
}

/**
 * Clear a specific cache entry
 * @param cacheKey - The cache key to clear
 */
export function clearCacheEntry(cacheKey: string): void {
  dataCache.delete(cacheKey);
}
