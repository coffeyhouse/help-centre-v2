/**
 * Footer - Site footer with links and information
 *
 * Features:
 * - Black background with white text
 * - Three columns: Popular Products, Product Roadmaps, Useful Links
 * - Social media icons
 * - Copyright and legal links
 * - Responsive design (stacks on mobile)
 */

import { Link } from 'react-router-dom';
import { useRegion } from '../../hooks/useRegion';
import Icon from '../common/Icon';

export default function Footer() {
  const { region } = useRegion();

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container-custom py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1 - Popular Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Products</h3>
            <ul className="space-y-2">
              <li>
                <Link to={`/${region}/products/product-a`} className="text-sm text-gray-300 hover:text-white transition-colors">
                  Product A
                </Link>
              </li>
              <li>
                <Link to={`/${region}/products/product-b`} className="text-sm text-gray-300 hover:text-white transition-colors">
                  Product B
                </Link>
              </li>
              <li>
                <Link to={`/${region}/products/product-c`} className="text-sm text-gray-300 hover:text-white transition-colors">
                  Product C
                </Link>
              </li>
              <li>
                <Link to={`/${region}/products/product-d`} className="text-sm text-gray-300 hover:text-white transition-colors">
                  Product D
                </Link>
              </li>
              <li>
                <Link to={`/${region}`} className="text-sm text-gray-300 hover:text-white transition-colors font-medium">
                  See all products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - Product Roadmaps */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product Roadmaps</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Product A Roadmap
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Product B Roadmap
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Product C Roadmap
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Product D Roadmap
                </a>
              </li>
            </ul>
          </div>

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
