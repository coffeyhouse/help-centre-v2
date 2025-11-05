/**
 * RegionContext - Manages region state and configuration
 *
 * Provides:
 * - Current region code (gb, ie)
 * - Region configuration data
 * - Function to change regions
 * - Automatic loading of region-specific data
 */

import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
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
 * to all child components via Context API
 *
 * @example
 * ```tsx
 * <RegionProvider initialRegion="gb">
 *   <App />
 * </RegionProvider>
 * ```
 */
export function RegionProvider({ children, initialRegion = 'gb' }: RegionProviderProps) {
  // Get initial region from localStorage or use default
  const [region, setRegion] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedRegion = localStorage.getItem('selectedRegion');
      return savedRegion || initialRegion;
    }
    return initialRegion;
  });

  const [regionConfig, setRegionConfig] = useState<RegionConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
   *
   * @param newRegion - The new region code to switch to (e.g., 'gb', 'ie')
   */
  const changeRegion = (newRegion: string) => {
    if (newRegion !== region) {
      setRegion(newRegion);
      // In Phase 4, this will also update the URL
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
