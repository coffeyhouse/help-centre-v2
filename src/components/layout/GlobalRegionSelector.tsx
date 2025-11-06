/**
 * GlobalRegionSelector - Dropdown component for switching to any country worldwide
 *
 * Features:
 * - Displays current country name with flag
 * - Dropdown menu with ALL available countries grouped by region
 * - Integrates with RegionContext for state management
 * - Updates URL when country changes
 * - Shows country flag and full name
 * - Groups countries by region in dropdown
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRegion } from '../../hooks/useRegion';
import { loadRegions } from '../../utils/dataLoader';
import type { Region } from '../../types';
import * as Flags from 'country-flag-icons/react/3x2';

interface RegionGroup {
  regionId: string;
  regionName: string;
  countries: Region[];
}

export default function GlobalRegionSelector() {
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

  // Group countries by region
  const groupedRegions = useMemo(() => {
    const groups = new Map<string, RegionGroup>();

    allRegions.forEach((country) => {
      const regionId = country.region;
      if (!groups.has(regionId)) {
        // Get region name from regionName field or format the region ID
        const regionName = (country as any).regionName ||
          regionId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        groups.set(regionId, {
          regionId,
          regionName,
          countries: [],
        });
      }
      groups.get(regionId)!.countries.push(country);
    });

    return Array.from(groups.values());
  }, [allRegions]);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current country button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded hover:bg-white/20 transition-colors text-white w-full"
        aria-label="Select country"
        aria-expanded={isOpen}
      >
        {getFlag(currentRegion?.code || 'GB')}
        <span className="text-sm font-medium flex-1 text-left">
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
        <div className="absolute bottom-full left-0 mb-2 w-full min-w-[280px] bg-white text-black rounded-md shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
          {groupedRegions.map((group) => (
            <div key={group.regionId} className="mb-2 last:mb-0">
              {/* Region header */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                {group.regionName}
              </div>

              {/* Countries in this region */}
              {group.countries.map((r) => (
                <button
                  key={r.code}
                  onClick={() => handleRegionChange(r.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    r.code === region ? 'bg-blue-50 font-medium' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getFlag(r.code)}
                    <span className="flex-1">{r.name}</span>
                    {r.code === region && (
                      <svg
                        className="w-4 h-4 text-blue-600"
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
          ))}
        </div>
      )}
    </div>
  );
}
