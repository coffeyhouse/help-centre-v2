/**
 * Header - Main navigation header
 *
 * Features:
 * - Black background with white text
 * - Logo on left
 * - Navigation links from region config
 * - RegionSelector on right
 * - Sticky positioning
 * - Responsive design with mobile menu
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegion } from '../../hooks/useRegion';
import RegionSelector from './RegionSelector';
import UserMenu from './UserMenu';
import Icon from '../common/Icon';

export default function Header() {
  const { region, regionConfig } = useRegion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = regionConfig?.navigation.main || [];

  return (
    <header className="bg-black text-white sticky top-0 z-40 shadow-lg">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to={`/${region}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Icon name="book" className="w-8 h-8" />
            <span className="text-xl font-semibold hidden sm:inline">
              Help Centre
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm hover:text-gray-300 transition-colors flex items-center gap-1"
              >
                {link.icon && <Icon name={link.icon} className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* User Menu */}
            <UserMenu />

            {/* Region Selector */}
            <RegionSelector />

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/10">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 px-4 hover:bg-white/10 rounded transition-colors"
              >
                <span className="flex items-center gap-2">
                  {link.icon && <Icon name={link.icon} className="w-5 h-5" />}
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
