/**
 * TopNavigation - Horizontal navigation bar for product pages
 *
 * Features:
 * - Links: Hot topics, Release notes (if available), Contact us
 * - Uses data from region config (if available)
 * - Horizontal layout with dividers
 * - Responsive design
 */

import { Link } from 'react-router-dom';
import { useRegion } from '../../../hooks/useRegion';
import { useData } from '../../../hooks/useData';
import { loadReleaseNotes } from '../../../utils/dataLoader';
import type { ReleaseNotesData } from '../../../types';

interface TopNavigationProps {
  productId?: string;
}

export default function TopNavigation({ productId }: TopNavigationProps) {
  const { region } = useRegion();

  // Load release notes to check if this product has any
  const { data: releaseNotesData } = useData<ReleaseNotesData>(
    () => productId ? loadReleaseNotes(region, productId) : Promise.resolve({ releaseNotes: {} }),
    [region, productId]
  );

  const hasReleaseNotes = releaseNotesData && productId &&
    releaseNotesData.releaseNotes[productId] &&
    releaseNotesData.releaseNotes[productId].length > 0;

  const links = [
    { label: 'Hot topics', path: `/${region}` },
    ...(hasReleaseNotes && productId ? [{ label: 'Release notes', path: `/${region}/products/${productId}/release-notes` }] : []),
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
