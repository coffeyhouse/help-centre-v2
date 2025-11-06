/**
 * RegionContext - Manages region state and configuration
 *
 * Provides:
 * - Current region code (gb, ie)
 * - Region configuration data
 * - Function to change regions
 * - Automatic loading of region-specific data
 * - Synchronization with URL parameters
 */

import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { loadRegionConfig } from '../utils/dataLoader';
import type { RegionContextValue, RegionConfig } from '../types';

// Create the context with undefined default (will be provided by RegionProvider)
export const RegionContext = createContext<RegionContextValue | undefined>(undefined);

interface RegionProviderProps {
  children: ReactNode;
  initialRegion?: string;
}

/**
 * RegionProvider component
 *
 * Wraps the application and provides region state and configuration
 * to all child components via Context API. Syncs with URL parameters.
 *
 * @example
 * ```tsx
 * <RegionProvider initialRegion="gb">
 *   <App />
 * </RegionProvider>
 * ```
 */
export function RegionProvider({ children, initialRegion = 'gb' }: RegionProviderProps) {
  const params = useParams<{ region: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract region from URL pathname (e.g., "/ie/products/..." -> "ie")
  const getRegionFromPath = (): string => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const firstPart = pathParts[0];
    // Check if first part is a valid region code
    if (firstPart && ['gb', 'ie'].includes(firstPart)) {
      return firstPart;
    }
    // Fall back to params or initial region
    return params.region || initialRegion;
  };

  // Get region from URL or use default
  const urlRegion = getRegionFromPath();

  const [region, setRegion] = useState<string>(urlRegion);
  const [regionConfig, setRegionConfig] = useState<RegionConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync region state with URL parameters
  useEffect(() => {
    const currentUrlRegion = getRegionFromPath();
    if (currentUrlRegion && currentUrlRegion !== region) {
      setRegion(currentUrlRegion);
    }
  }, [location.pathname]); // Re-run when pathname changes

  // Load region configuration when region changes
  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const config = await loadRegionConfig(region);

        if (isMounted) {
          setRegionConfig(config);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error
            ? err.message
            : `Failed to load configuration for region: ${region}`;
          setError(errorMessage);
          console.error('RegionContext: Failed to load region config', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, [region]);

  // Save region to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedRegion', region);
    }
  }, [region]);

  /**
   * Change the current region
   * This will trigger a reload of region-specific configuration and data
   * and update the URL to reflect the new region
   *
   * @param newRegion - The new region code to switch to (e.g., 'gb', 'ie')
   */
  const changeRegion = (newRegion: string) => {
    if (newRegion !== region) {
      setRegion(newRegion);

      // Update URL to reflect new region while maintaining the current path structure
      const pathParts = location.pathname.split('/').filter(Boolean);

      // If we're on a region-based route, replace the region
      if (pathParts.length > 0 && ['gb', 'ie'].includes(pathParts[0])) {
        pathParts[0] = newRegion;
        navigate(`/${pathParts.join('/')}`);
      } else {
        // Navigate to homepage of new region
        navigate(`/${newRegion}`);
      }
    }
  };

  const value: RegionContextValue = {
    region,
    regionConfig,
    changeRegion,
    loading,
    error,
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
}
