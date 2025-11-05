/**
 * Hero - Hero section component
 *
 * Features:
 * - Black background with white text
 * - Title and subtitle
 * - Optional search bar
 * - Responsive grid layout with illustration placeholder
 * - Consistent styling across pages
 */

import { useState } from 'react';
import type { HeroProps } from '../../types';
import Icon from './Icon';

export default function Hero({
  title,
  subtitle,
  searchBar = false,
  searchPlaceholder = 'Search for answers...',
}: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality in future phases
    console.log('Search query:', searchQuery);
  };

  return (
    <div className="bg-black text-white py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left column - Content */}
          <div>
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-300 mb-6">
              {subtitle}
            </p>

            {/* Search bar (optional) */}
            {searchBar && (
              <div className="mt-6">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full px-4 py-3 pr-12 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                    aria-label="Search"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </form>

                {/* Tip text */}
                <p className="text-xs text-gray-400 mt-2">
                  Use detailed phrases or exact error messages to find the most relevant help guides
                </p>
              </div>
            )}
          </div>

          {/* Right column - Illustration placeholder */}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-64 h-64 bg-gray-800 rounded-lg flex items-center justify-center">
              <Icon name="book" className="w-32 h-32 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
