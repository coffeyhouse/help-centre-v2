/**
 * Footer - Site footer with links and information
 *
 * Features:
 * - Black background with white text
 * - Three columns: Popular Products, Release Notes, Useful Links
 * - Social media icons
 * - Copyright and legal links
 * - Responsive design (stacks on mobile)
 * - Dynamically populated from products.json and release-notes.json
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRegion } from '../../hooks/useRegion';
import { useData } from '../../hooks/useData';
import { loadProducts, loadReleaseNotes } from '../../utils/dataLoader';
import Icon from '../common/Icon';
import type { ProductsData, ReleaseNotesData } from '../../types';

export default function Footer() {
  const { region } = useRegion();

  // Load products data
  const { data: productsData } = useData<ProductsData>(() => loadProducts(region), [region]);

  // Load release notes data
  const { data: releaseNotesData } = useData<ReleaseNotesData>(() => loadReleaseNotes(region), [region]);

  // Filter products by country
  const availableProducts = useMemo(() => {
    if (!productsData?.products) return [];
    return productsData.products.filter(
      (product) => !product.countries || product.countries.includes(region)
    );
  }, [productsData, region]);

  // Get products that have release notes
  const productsWithReleaseNotes = useMemo(() => {
    if (!releaseNotesData?.releaseNotes || !availableProducts.length) return [];

    return availableProducts.filter((product) => {
      const notes = releaseNotesData.releaseNotes[product.id];
      return notes && notes.length > 0;
    });
  }, [releaseNotesData, availableProducts]);

  // Get top 4 popular products (or less if fewer available)
  const popularProducts = useMemo(() => {
    return availableProducts.slice(0, 4);
  }, [availableProducts]);

  // Show release notes column only if there are products with release notes
  const showReleaseNotes = productsWithReleaseNotes.length > 0;

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container-custom py-12">
        {/* Main footer content */}
        <div className={`grid grid-cols-1 gap-8 mb-8 ${showReleaseNotes ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {/* Column 1 - Popular Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Products</h3>
            <ul className="space-y-2">
              {popularProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/${region}/products/${product.id}`}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
              {availableProducts.length > 4 && (
                <li>
                  <Link
                    to={`/${region}`}
                    className="text-sm text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    See all products →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Column 2 - Release Notes (conditional) */}
          {showReleaseNotes && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Release Notes</h3>
              <ul className="space-y-2">
                {productsWithReleaseNotes.slice(0, 4).map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/${region}/products/${product.id}/release-notes`}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 3 - Useful Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Community Hub
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Store
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Training
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Advice Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Main Website
                </a>
              </li>
              <li>
                <Link to={`/${region}/contact`} className="text-sm text-gray-300 hover:text-white transition-colors">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social media links */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
          <span className="text-sm text-gray-400">Follow us:</span>
          <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
            <Icon name="instagram" className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
            <Icon name="facebook" className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
            <Icon name="linkedin" className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
            <Icon name="twitter" className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="YouTube">
            <Icon name="youtube" className="w-5 h-5" />
          </a>
        </div>

        {/* Legal footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            © {new Date().getFullYear()} Help Centre. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">
              Legal
            </a>
            <a href="#" className="hover:text-white transition-colors">
              GDPR
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy & Cookies
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Accessibility
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Phishing Advice
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
