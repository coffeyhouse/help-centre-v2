import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminRegion } from '../../context/AdminRegionContext';
import {
  ArrowLeftOnRectangleIcon,
  HomeIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';
import { useState, useRef, useEffect } from 'react';

interface AdminHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  showRegionSelector?: boolean;
}

export default function AdminHeader({ breadcrumbs = [], showRegionSelector = true }: AdminHeaderProps) {
  const { logout } = useAdminAuth();
  const { selectedRegion, regions, selectRegion } = useAdminRegion();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the current region object
  const currentRegion = regions.find((r) => r.id === selectedRegion);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleHomeClick = () => {
    if (selectedRegion) {
      navigate(`/admin/${selectedRegion}/menu`);
    } else {
      navigate('/admin/regions');
    }
  };

  const handleRegionChange = (regionId: string) => {
    selectRegion(regionId);
    setIsDropdownOpen(false);
    navigate(`/admin/${regionId}/menu`);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with logo, region selector, and actions */}
        <div className="py-4 flex justify-between items-center">
          {/* Left side - Logo and Region Selector */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Admin</h1>

            {/* Region Selector Dropdown */}
            {showRegionSelector && currentRegion && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>{currentRegion.name}</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && regions.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Switch Region
                    </div>
                    {regions.map((region) => (
                      <button
                        key={region.id}
                        onClick={() => handleRegionChange(region.id)}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          region.id === selectedRegion
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{region.name}</div>
                        <div className="text-xs text-gray-500">{region.countries.join(', ')}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Home Button */}
            {selectedRegion && (
              <button
                onClick={handleHomeClick}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go to menu"
              >
                <HomeIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Menu</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="pb-4 border-t border-gray-200 pt-3">
            <Breadcrumbs items={breadcrumbs} homeLink="/admin/regions" />
          </div>
        )}
      </div>
    </header>
  );
}
