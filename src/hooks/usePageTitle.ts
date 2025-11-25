/**
 * usePageTitle - Custom hook for managing page titles
 *
 * Usage:
 * usePageTitle('Contact Us'); // Sets title to "Contact Us | Support Centre"
 * usePageTitle('Products', 'Sage 50'); // Sets title to "Products - Sage 50 | Support Centre"
 */

import { useEffect } from 'react';

const BASE_TITLE = 'Support Centre';

export function usePageTitle(title?: string, subtitle?: string) {
  useEffect(() => {
    if (!title) {
      document.title = BASE_TITLE;
      return;
    }

    let fullTitle = title;

    if (subtitle) {
      fullTitle = `${title} - ${subtitle}`;
    }

    document.title = `${fullTitle} | ${BASE_TITLE}`;

    // Cleanup: reset to base title when component unmounts
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, subtitle]);
}
