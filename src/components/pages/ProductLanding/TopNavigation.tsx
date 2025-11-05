/**
 * TopNavigation - Horizontal navigation bar for product pages
 *
 * Features:
 * - Links: Hot topics, Contact us
 * - Uses data from region config (if available)
 * - Horizontal layout with dividers
 * - Responsive design
 */

import { Link } from 'react-router-dom';
import { useRegion } from '../../../hooks/useRegion';

export default function TopNavigation() {
  const { region } = useRegion();

  const links = [
    { label: 'Hot topics', path: `/${region}` },
    { label: 'Contact us', path: `/${region}/contact` },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container-custom">
        <div className="flex items-center gap-6 py-3">
          {links.map((link, index) => (
            <div key={link.path} className="flex items-center gap-6">
              <Link
                to={link.path}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
              {index < links.length - 1 && (
                <div className="h-4 w-px bg-gray-300" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
