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
import { loadRegionConfig, loadRegions } from '../utils/dataLoader';
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

  // State for valid region codes (loaded from regions.json)
  const [validRegionCodes, setValidRegionCodes] = useState<string[]>([]);

  // Extract region from URL pathname (e.g., "/ie/products/..." -> "ie")
  const getRegionFromPath = (): string => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const firstPart = pathParts[0];
    // Check if first part is a valid region code
    // If validRegionCodes hasn't loaded yet, allow common codes as fallback
    const validCodes = validRegionCodes.length > 0 ? validRegionCodes : ['gb', 'ie'];
    if (firstPart && validCodes.includes(firstPart)) {
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

  // Load valid region codes on mount
  useEffect(() => {
    let isMounted = true;

    const fetchValidRegions = async () => {
      try {
        const regions = await loadRegions();
        if (isMounted) {
          const codes = regions.map((r) => r.code);
          setValidRegionCodes(codes);
        }
      } catch (err) {
        console.error('Failed to load valid region codes:', err);
        // Fallback to common region codes if loading fails
        if (isMounted) {
          setValidRegionCodes(['gb', 'ie']);
        }
      }
    };

    fetchValidRegions();

    return () => {
      isMounted = false;
    };
  }, []);

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
      // Use dynamic validRegionCodes, fallback to common codes if not loaded yet
      const validCodes = validRegionCodes.length > 0 ? validRegionCodes : ['gb', 'ie'];
      if (pathParts.length > 0 && validCodes.includes(pathParts[0])) {
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
