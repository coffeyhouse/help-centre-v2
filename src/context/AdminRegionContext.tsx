/**
 * AdminRegionContext - Manages admin region selection and state
 *
 * Provides:
 * - Current selected admin region (e.g., "uk-ireland")
 * - List of available regions
 * - Function to change/select regions
 * - Persistence to localStorage
 */

import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

export interface Region {
  id: string;
  name: string;
  code: string;
  countries: string[];
  currency: string;
  dateFormat: string;
  language: string;
}

interface AdminRegionContextValue {
  selectedRegion: string | null;
  regions: Region[];
  selectRegion: (regionId: string) => void;
  clearRegion: () => void;
  loading: boolean;
  error: string | null;
  refreshRegions: () => Promise<void>;
}

const AdminRegionContext = createContext<AdminRegionContextValue | undefined>(undefined);

interface AdminRegionProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'admin_selected_region';

export function AdminRegionProvider({ children }: AdminRegionProviderProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load regions from API
  const loadRegions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/regions');
      if (!response.ok) {
        throw new Error('Failed to load regions');
      }

      const data = await response.json();
      setRegions(data.regions || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load regions';
      setError(errorMessage);
      console.error('AdminRegionContext: Failed to load regions', err);
    } finally {
      setLoading(false);
    }
  };

  // Load regions on mount
  useEffect(() => {
    loadRegions();
  }, []);

  // Load selected region from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedRegion(stored);
      }
    }
  }, []);

  // Save selected region to localStorage when it changes
  useEffect(() => {
    if (selectedRegion && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, selectedRegion);
    }
  }, [selectedRegion]);

  const selectRegion = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  const clearRegion = () => {
    setSelectedRegion(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const refreshRegions = async () => {
    await loadRegions();
  };

  const value: AdminRegionContextValue = {
    selectedRegion,
    regions,
    selectRegion,
    clearRegion,
    loading,
    error,
    refreshRegions,
  };

  return (
    <AdminRegionContext.Provider value={value}>
      {children}
    </AdminRegionContext.Provider>
  );
}

/**
 * Hook to access admin region context
 * Must be used within AdminRegionProvider
 */
export function useAdminRegion() {
  const context = useContext(AdminRegionContext);
  if (context === undefined) {
    throw new Error('useAdminRegion must be used within AdminRegionProvider');
  }
  return context;
}
