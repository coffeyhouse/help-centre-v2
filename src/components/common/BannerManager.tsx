/**
 * BannerManager - Manages and displays incident banners based on current page context
 *
 * Features:
 * - Loads incident banners for the current region
 * - Filters banners based on scope (global, product, page)
 * - Displays the highest priority banner
 * - Priority order: error > caution > info > resolved
 */

import { useLocation, useParams } from 'react-router-dom';
import { useRegion } from '../../hooks/useRegion';
import { useData } from '../../hooks/useData';
import { loadIncidentBanners } from '../../utils/dataLoader';
import IncidentBanner from './IncidentBanner';
import type { IncidentBanner as IncidentBannerType, IncidentBannerState } from '../../types';

export default function BannerManager() {
  const { region } = useRegion();
  const location = useLocation();
  const params = useParams<{ productId?: string }>();

  // Load incident banners for current region
  const { data: incidentsData } = useData(
    () => loadIncidentBanners(region),
    [region]
  );

  if (!incidentsData) {
    return null;
  }

  // Get all active banners
  const activeBanners = incidentsData.banners.filter(banner => banner.active);

  if (activeBanners.length === 0) {
    return null;
  }

  // Filter banners based on current context
  const relevantBanners = activeBanners.filter(banner => {
    const { scope } = banner;

    // Global banners apply to all pages
    if (scope.type === 'global') {
      return true;
    }

    // Product-specific banners
    if (scope.type === 'product' && params.productId) {
      return scope.productIds?.includes(params.productId);
    }

    // Page-specific banners
    if (scope.type === 'page' && scope.pagePatterns) {
      return scope.pagePatterns.some(pattern => {
        // Simple pattern matching - convert pattern to regex
        // e.g., "/contact" matches exactly, "/products/:productId" matches any product page
        const regexPattern = pattern
          .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
          .replace(/\//g, '\\/'); // Escape forward slashes

        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(location.pathname);
      });
    }

    return false;
  });

  if (relevantBanners.length === 0) {
    return null;
  }

  // Sort banners by priority: error > caution > info > resolved
  const priorityMap: Record<IncidentBannerState, number> = {
    error: 4,
    caution: 3,
    info: 2,
    resolved: 1,
  };

  const sortedBanners = [...relevantBanners].sort((a, b) => {
    return priorityMap[b.state] - priorityMap[a.state];
  });

  // Display the highest priority banner
  const bannerToDisplay = sortedBanners[0];

  return <IncidentBanner banner={bannerToDisplay} />;
}
