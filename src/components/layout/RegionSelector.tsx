/**
 * RegionSelector - Dropdown component for switching regions
 *
 * Features:
 * - Displays current region (GB or IE)
 * - Dropdown menu with all available regions
 * - Integrates with RegionContext for state management
 * - Updates URL when region changes
 * - Shows region flag/code and name
 */

import { useState, useEffect, useRef } from 'react';
import { useRegion } from '../../hooks/useRegion';
import { loadRegions } from '../../utils/dataLoader';
import type { Region } from '../../types';

export default function RegionSelector() {
  const { region, changeRegion } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load available regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await loadRegions();
        setRegions(data);
      } catch (error) {
        console.error('Failed to load regions:', error);
      }
    };

    fetchRegions();
  }, []);

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

  const currentRegion = regions.find((r) => r.code === region);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current region button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-white/20 rounded hover:bg-white/10 transition-colors text-white"
        aria-label="Select region"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium">
          {currentRegion?.code.toUpperCase() || 'GB'}
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
        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-1 z-50">
          {regions.map((r) => (
            <button
              key={r.code}
              onClick={() => handleRegionChange(r.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                r.code === region ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{r.name}</span>
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
