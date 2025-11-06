/**
 * Mock Search API
 *
 * This mock API simulates search functionality until a real API is implemented.
 * It filters mock data based on search query, region, product(s), taxonomy, attributes, and language.
 *
 * Supported parameters:
 * - query: Search query string (searches title, summary)
 * - country: Country code (from URL/context)
 * - products: Array of product IDs (optional)
 * - taxonomy: Taxonomy filter (optional)
 * - attributes: Key-value attributes filter (optional)
 * - language: Language code (optional)
 */

import type { SearchResult, SearchParams, SearchResponse } from '../types';

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
 * Calculate relevance score for a search result
 */
function calculateRelevanceScore(result: SearchResult, searchTerm: string): number {
  let score = 0;
  const term = searchTerm.toLowerCase();
  const title = result.title.toLowerCase();
  const summary = result.summary.toLowerCase();

  // Exact title match: highest score
  if (title === term) {
    score += 100;
  }
  // Title starts with search term
  else if (title.startsWith(term)) {
    score += 50;
  }
  // Title contains search term
  else if (title.includes(term)) {
    score += 30;
  }

  // Summary contains search term
  if (summary.includes(term)) {
    score += 10;
  }

  // Boost score for shorter titles (likely more specific)
  if (result.title.length < 50) {
    score += 5;
  }

  return score;
}

/**
 * Check if attributes match the filter
 */
function matchesAttributes(
  resultAttributes: Record<string, string> | undefined,
  filterAttributes: Record<string, string> | undefined
): boolean {
  if (!filterAttributes || Object.keys(filterAttributes).length === 0) {
    return true; // No filter, all match
  }

  if (!resultAttributes) {
    return false; // Filter exists but result has no attributes
  }

  // Check if all filter attributes match
  return Object.entries(filterAttributes).every(
    ([key, value]) => resultAttributes[key] === value
  );
}

/**
 * Enhanced mock search function with full parameter support
 *
 * @param params - Search parameters object
 * @returns Promise resolving to SearchResponse with results and metadata
 */
export async function search(params: SearchParams): Promise<SearchResponse> {
  const startTime = performance.now();

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const {
    query,
    country,
    products,
    taxonomy,
    attributes,
    language,
    limit = 50,
    offset = 0
  } = params;

  // Map country to region
  const region = country === 'ie' ? 'uk-ireland' : 'uk-ireland'; // Simplified for now

  // Load search results from JSON
  const allResults = await loadSearchResults(region);

  // Return empty results if no query
  if (!query || query.trim().length === 0) {
    return {
      results: [],
      total: 0,
      hasMore: false,
      query: query || '',
      filters: { country, products, taxonomy, attributes, language },
      executionTime: performance.now() - startTime
    };
  }

  const searchTerm = query.toLowerCase().trim();

  // Filter and score results
  let results = allResults
    .filter(item => {
      // Text search: title or summary
      const titleMatch = item.title.toLowerCase().includes(searchTerm);
      const summaryMatch = item.summary.toLowerCase().includes(searchTerm);
      if (!titleMatch && !summaryMatch) {
        return false;
      }

      // Filter by products (multiple)
      if (products && products.length > 0) {
        if (!item.productId || !products.includes(item.productId)) {
          return false;
        }
      }

      // Filter by taxonomy
      if (taxonomy && item.taxonomy) {
        if (!item.taxonomy.includes(taxonomy)) {
          return false;
        }
      }

      // Filter by attributes
      if (!matchesAttributes(item.attributes, attributes)) {
        return false;
      }

      // Filter by language
      if (language && item.language) {
        if (item.language !== language) {
          return false;
        }
      }

      return true;
    })
    .map(item => ({
      ...item,
      relevanceScore: calculateRelevanceScore(item, searchTerm)
    }))
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  const total = results.length;
  const paginatedResults = results.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  const executionTime = performance.now() - startTime;

  return {
    results: paginatedResults,
    total,
    hasMore,
    query,
    filters: { country, products, taxonomy, attributes, language },
    executionTime
  };
}

/**
 * Legacy search function for backward compatibility
 * @deprecated Use search() with SearchParams instead
 */
export async function searchArticles(
  query: string,
  region: string,
  productId?: string,
  limit?: number
): Promise<SearchResult[]> {
  const params: SearchParams = {
    query,
    country: region,
    products: productId ? [productId] : undefined,
    limit
  };

  const response = await search(params);
  return response.results;
}
