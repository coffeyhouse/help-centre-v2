import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { usePageTitle } from '../hooks/usePageTitle';
import { loadRegions } from '../utils/dataLoader';
import type { Region } from '../types';

interface RegionGroup {
  regionId: string;
  regionName: string;
  countries: Region[];
}

export default function CountrySelector() {
  const navigate = useNavigate();
  const [regions, setRegions] = useState<RegionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Set page title
  usePageTitle('Select Your Region');

  useEffect(() => {
    loadCountryData();
  }, []);

  const loadCountryData = async () => {
    try {
      const allCountries = await loadRegions();

      // Group countries by region
      const regionsMap = new Map<string, RegionGroup>();

      allCountries.forEach((country) => {
        const regionId = country.region;
        if (!regionsMap.has(regionId)) {
          // Get region name from first country's regionName or format the region ID
          const regionName = (country as any).regionName || formatRegionName(regionId);
          regionsMap.set(regionId, {
            regionId,
            regionName,
            countries: [],
          });
        }
        regionsMap.get(regionId)!.countries.push(country);
      });

      setRegions(Array.from(regionsMap.values()));
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRegionName = (regionId: string): string => {
    return regionId
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCountrySelect = (countryCode: string) => {
    navigate(`/${countryCode}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading countries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <GlobeAltIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Country</h1>
          <p className="text-gray-600">
            Choose your country to see relevant content and support options
          </p>
        </div>

        {/* Regions */}
        <div className="space-y-8">
          {regions.map((region) => (
            <div key={region.regionId} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{region.regionName}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {region.countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country.code)}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded group-hover:bg-blue-100 transition-colors">
                      <GlobeAltIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {country.name}
                      </div>
                      <div className="text-xs text-gray-500 uppercase">{country.code}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {regions.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No countries available</p>
          </div>
        )}
      </div>
    </div>
  );
}
