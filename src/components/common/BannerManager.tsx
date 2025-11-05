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

  // Debug logging
  console.log('BannerManager Debug:', {
    pathname: location.pathname,
    productId: params.productId,
    totalBanners: incidentsData.banners.length,
    activeBanners: activeBanners.length,
    activeBannerIds: activeBanners.map(b => b.id),
  });

  if (activeBanners.length === 0) {
    return null;
  }

  // Filter banners based on current context
  const relevantBanners = activeBanners.filter(banner => {
    const { scope } = banner;

    // Global banners apply to all pages
    if (scope.type === 'global') {
      console.log(`Banner ${banner.id}: Global banner - SHOWING`);
      return true;
    }

    // Product-specific banners
    if (scope.type === 'product' && params.productId) {
      const matches = scope.productIds?.includes(params.productId);
      console.log(`Banner ${banner.id}: Product banner - productId=${params.productId}, targetProducts=${scope.productIds}, matches=${matches}`);
      return matches;
    }

    // Product-specific banners but no productId in URL
    if (scope.type === 'product' && !params.productId) {
      console.log(`Banner ${banner.id}: Product banner but no productId in URL - HIDING`);
      return false;
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
        const matches = regex.test(location.pathname);
        console.log(`Banner ${banner.id}: Page banner - pattern=${pattern}, pathname=${location.pathname}, matches=${matches}`);
        return matches;
      });
    }

    console.log(`Banner ${banner.id}: No matching scope - HIDING`);
    return false;
  });

  console.log('Relevant banners:', relevantBanners.map(b => b.id));

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
