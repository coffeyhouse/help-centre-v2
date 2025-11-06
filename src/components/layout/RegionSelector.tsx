/**
 * RegionSelector - Dropdown component for switching countries within current region
 *
 * Features:
 * - Displays current country name
 * - Dropdown menu with countries in the same region only
 * - Integrates with RegionContext for state management
 * - Updates URL when country changes
 * - Shows country flag and name
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRegion } from '../../hooks/useRegion';
import { loadRegions } from '../../utils/dataLoader';
import type { Region } from '../../types';
import * as Flags from 'country-flag-icons/react/3x2';

export default function RegionSelector() {
  const { region, changeRegion } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const [allRegions, setAllRegions] = useState<Region[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load available regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await loadRegions();
        setAllRegions(data);
      } catch (error) {
        console.error('Failed to load regions:', error);
      }
    };

    fetchRegions();
  }, []);

  // Filter regions to only show countries in the current region
  const regionsInCurrentArea = useMemo(() => {
    const currentRegion = allRegions.find((r) => r.code === region);
    if (!currentRegion) return allRegions;

    // Get the region identifier (e.g., "uk-ireland", "north-america")
    const regionId = currentRegion.region;

    // Filter to only show countries in the same region
    return allRegions.filter((r) => r.region === regionId);
  }, [allRegions, region]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRegionChange = (newRegion: string) => {
    changeRegion(newRegion);
    setIsOpen(false);
  };

  const currentRegion = allRegions.find((r) => r.code === region);

  // Get flag component for a country code
  const getFlag = (countryCode: string) => {
    const code = countryCode.toUpperCase();
    const FlagComponent = Flags[code as keyof typeof Flags];
    return FlagComponent ? <FlagComponent className="w-5 h-4 rounded-sm" /> : null;
  };

  // Don't show selector if only one country in the region
  if (regionsInCurrentArea.length <= 1) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current country button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-white/20 rounded hover:bg-white/10 transition-colors text-white"
        aria-label="Select country"
        aria-expanded={isOpen}
      >
        {getFlag(currentRegion?.code || 'GB')}
        <span className="text-sm font-medium">
          {currentRegion?.name || 'United Kingdom'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-md shadow-lg py-1 z-50">
          {regionsInCurrentArea.map((r) => (
            <button
              key={r.code}
              onClick={() => handleRegionChange(r.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                r.code === region ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {getFlag(r.code)}
                <span className="flex-1">{r.name}</span>
                {r.code === region && (
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
