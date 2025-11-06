/**
 * PopupManager - Manages and displays popup modals based on current page context
 *
 * Features:
 * - Loads popup modals for the current region
 * - Filters popups based on scope (global, product, topic, page)
 * - Displays the highest priority popup
 * - Respects trigger types (immediate, delay, scroll)
 * - Manages permanent dismissal via localStorage
 */

import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useRegion } from '../../hooks/useRegion';
import { useData } from '../../hooks/useData';
import { loadPopups } from '../../utils/dataLoader';
import PopupModal from './PopupModal';
import type { PopupModal as PopupModalType } from '../../types';

const DISMISSED_POPUPS_KEY = 'dismissedPopups';

// Helper functions for localStorage
function getDismissedPopups(): string[] {
  try {
    const dismissed = localStorage.getItem(DISMISSED_POPUPS_KEY);
    return dismissed ? JSON.parse(dismissed) : [];
  } catch (error) {
    console.error('Error reading dismissed popups from localStorage:', error);
    return [];
  }
}

function addDismissedPopup(popupId: string): void {
  try {
    const dismissed = getDismissedPopups();
    if (!dismissed.includes(popupId)) {
      dismissed.push(popupId);
      localStorage.setItem(DISMISSED_POPUPS_KEY, JSON.stringify(dismissed));
    }
  } catch (error) {
    console.error('Error saving dismissed popup to localStorage:', error);
  }
}

export default function PopupManager() {
  const { region } = useRegion();
  const location = useLocation();
  const params = useParams<{ productId?: string; topicId?: string; subtopicId?: string }>();
  const [showPopup, setShowPopup] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<PopupModalType | null>(null);

  const { productId, topicId, subtopicId } = params;

  // Load popups for current region
  const { data: popupsData } = useData(
    () => loadPopups(region),
    [region]
  );

  useEffect(() => {
    if (!popupsData) {
      return;
    }

    // Get all active popups
    const activePopups = popupsData.popups.filter(popup => popup.active);

    if (activePopups.length === 0) {
      return;
    }

    // Filter out dismissed popups
    const dismissedPopups = getDismissedPopups();
    const notDismissedPopups = activePopups.filter(
      popup => !dismissedPopups.includes(popup.id)
    );

    if (notDismissedPopups.length === 0) {
      return;
    }

    // Filter popups based on current context
    const relevantPopups = notDismissedPopups.filter(popup => {
      const { scope } = popup;

      // Global popups apply to all pages
      if (scope.type === 'global') {
        return true;
      }

      // Product-specific popups
      if (scope.type === 'product' && productId) {
        return scope.productIds?.includes(productId);
      }

      // Topic-specific popups (requires both productId and topicId match)
      if (scope.type === 'topic' && productId && topicId) {
        const productMatches = scope.productIds?.includes(productId);
        const topicMatches = scope.topicIds?.includes(topicId);
        return productMatches && topicMatches;
      }

      // Page-specific popups
      if (scope.type === 'page' && scope.pagePatterns) {
        return scope.pagePatterns.some(pattern => {
          // Convert pattern to regex
          const regexPattern = pattern
            .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
            .replace(/\//g, '\\/'); // Escape forward slashes

          const regex = new RegExp(`^${regexPattern}$`);
          return regex.test(location.pathname);
        });
      }

      return false;
    });

    if (relevantPopups.length === 0) {
      return;
    }

    // Sort by priority (higher number = higher priority)
    const sortedPopups = [...relevantPopups].sort((a, b) => b.priority - a.priority);

    // Get the highest priority popup
    const popupToShow = sortedPopups[0];
    setCurrentPopup(popupToShow);

    // Handle different trigger types
    const { trigger } = popupToShow;

    if (trigger.type === 'immediate') {
      // Show after 0.5s for better UX
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 500);

      return () => clearTimeout(timer);
    } else if (trigger.type === 'delay' && trigger.delay) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, trigger.delay);

      return () => clearTimeout(timer);
    } else if (trigger.type === 'scroll' && trigger.scrollPercentage) {
      const handleScroll = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        if (scrollPercent >= (trigger.scrollPercentage || 0)) {
          setShowPopup(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [popupsData, location.pathname, productId, topicId, subtopicId, region]);

  const handleDismiss = () => {
    if (currentPopup) {
      addDismissedPopup(currentPopup.id);
      setShowPopup(false);
      setCurrentPopup(null);
    }
  };

  if (!showPopup || !currentPopup) {
    return null;
  }

  return <PopupModal popup={currentPopup} onDismiss={handleDismiss} />;
}
