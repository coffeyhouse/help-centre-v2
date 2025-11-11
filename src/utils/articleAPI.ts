/**
 * Article API utility functions
 *
 * This module provides functions for fetching individual articles from the API.
 */

import type { ArticleResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Fetches a single article by ID from the API
 *
 * @param id - The article ID (must be 15 numeric characters)
 * @param country - The country code (gb, ie, us, ca)
 * @returns Promise<ArticleResponse>
 * @throws Error if the article is not found or the request fails
 */
export async function fetchArticle(
  id: string,
  country: string = 'gb'
): Promise<ArticleResponse> {
  try {
    // Validate article ID format
    if (!/^\d{15}$/.test(id)) {
      throw new Error('Invalid article ID format. Must be 15 numeric characters.');
    }

    const response = await fetch(`${API_URL}/api/article/${id}?country=${country}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Article with ID ${id} not found`);
      }
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || `Failed to fetch article: ${response.statusText}`
      );
    }

    const article: ArticleResponse = await response.json();
    return article;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
}

/**
 * Gets the external knowledge base URL for an article
 *
 * @param solutionId - The article/solution ID
 * @param region - The region code (gb, ie, us, ca)
 * @returns The external knowledge base URL
 */
export function getKnowledgeBaseUrl(solutionId: string, region: string = 'gb'): string {
  const regionPrefix = region || 'gb';
  return `https://${regionPrefix}-kb.sagedatacloud.com/portal/app/portlets/results/viewsolution.jsp?solutionid=${solutionId}`;
}

/**
 * Determines whether to use the article API or external links
 * based on the environment variable
 *
 * @returns true if article API should be used, false otherwise
 */
export function shouldUseArticleAPI(): boolean {
  const useArticleAPI = import.meta.env.VITE_USE_ARTICLE_API;
  return useArticleAPI === 'true' || useArticleAPI === true;
}

/**
 * Gets the article URL (either internal or external) based on configuration
 *
 * @param solutionId - The article/solution ID
 * @param region - The region code (gb, ie, us, ca)
 * @returns The article URL (internal route or external knowledge base)
 */
export function getArticleUrl(solutionId: string, region: string = 'gb'): string {
  if (shouldUseArticleAPI()) {
    return `/${region}/article/${solutionId}`;
  }
  return getKnowledgeBaseUrl(solutionId, region);
}

/**
 * Checks if a URL should open in a new tab
 *
 * @param url - The URL to check
 * @returns true if the URL should open in a new tab (external), false otherwise (internal)
 */
export function shouldOpenInNewTab(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
