/**
 * Mock Search API
 *
 * This mock API simulates search functionality until a real API is implemented.
 * It filters mock data based on search query, region, and product.
 */

import type { SearchResult } from '../types';

// Cache for search results data
let searchResultsCache: SearchResult[] | null = null;

/**
 * Load search results from JSON file
 */
async function loadSearchResults(region: string): Promise<SearchResult[]> {
  // Return cached data if available
  if (searchResultsCache !== null) {
    return searchResultsCache;
  }

  try {
    // Determine region path
    const regionPath = region === 'ie' ? 'uk-ireland' : 'uk-ireland'; // Both GB and IE use uk-ireland region

    const response = await fetch(`/data/regions/${regionPath}/search-results.json`);
    if (!response.ok) {
      throw new Error(`Failed to load search results: ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.searchResults || [];
    searchResultsCache = results;
    return results;
  } catch (error) {
    console.error('Error loading search results:', error);
    return [];
  }
}

/**
 * Mock search function
 *
 * @param query - Search query string
 * @param region - Region code (e.g., 'gb', 'ie')
 * @param productId - Optional product ID to filter results
 * @param limit - Maximum number of results to return
 * @returns Promise resolving to array of search results
 */
export async function searchArticles(
  query: string,
  region: string,
  productId?: string,
  limit?: number
): Promise<SearchResult[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  if (!query || query.trim().length === 0) {
    return [];
  }

  // Load search results from JSON
  const allResults = await loadSearchResults(region);

  const searchTerm = query.toLowerCase().trim();

  // Filter results based on query
  let results = allResults.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(searchTerm);
    const summaryMatch = item.summary.toLowerCase().includes(searchTerm);
    return titleMatch || summaryMatch;
  });

  // Filter by product if specified
  if (productId) {
    results = results.filter(item => item.productId === productId);
  }

  // Apply limit if specified
  if (limit) {
    results = results.slice(0, limit);
  }

  return results;
}
