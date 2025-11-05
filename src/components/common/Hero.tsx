/**
 * Hero - Hero section component
 *
 * Features:
 * - Black background with white text
 * - Title and subtitle
 * - Optional search bar with type-ahead
 * - Responsive grid layout with illustration placeholder
 * - Consistent styling across pages
 */

import type { HeroProps } from '../../types';
import Icon from './Icon';
import SearchBar from './SearchBar';

export default function Hero({
  title,
  subtitle,
  searchBar = false,
  searchPlaceholder = 'Search for answers...',
  productId,
}: HeroProps) {

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
                <SearchBar
                  placeholder={searchPlaceholder}
                  productId={productId}
                />
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
