/**
 * Breadcrumb - Navigation breadcrumb component
 *
 * Features:
 * - Shows navigation path (e.g., Product > Support hubs > Topic)
 * - Arrows between items
 * - Clickable links for navigation
 * - Current item styled differently (not clickable)
 * - Accessible with proper ARIA attributes
 */

import { Link } from 'react-router-dom';
import type { BreadcrumbItem } from '../../types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      className="flex items-center gap-2 text-sm text-gray-600 mb-4"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.current || isLast;

          return (
            <li key={index} className="flex items-center gap-2">
              {/* Breadcrumb item */}
              {isCurrent ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path || '#'}
                  className="hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              )}

              {/* Arrow separator (not shown for last item) */}
              {!isLast && (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
