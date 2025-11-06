/**
 * Data loading utilities for Help Centre application
 * Provides helper functions to fetch JSON data from the public/data directory
 */

import type {
  Region,
  RegionConfig,
  ProductsData,
  TopicsData,
  ArticlesData,
  ContactData,
  ArticleItem,
  IncidentBannersData,
  PopupsData,
  ReleaseNotesData
} from '../types';

const BASE_DATA_PATH = '/data';

/**
 * Generic function to fetch JSON data
 * @param path - Relative path to the JSON file
 * @returns Promise resolving to the parsed JSON data
 */
async function fetchJSON<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Filter items by country - only return items that apply to the given country
 * If an item has no countries field, it applies to all countries in the region
 * @param items - Array of items with optional countries field
 * @param countryCode - Country code to filter by
 * @returns Filtered array of items
 */
function filterByCountry<T extends { countries?: string[] }>(
  items: T[],
  countryCode: string
): T[] {
  const normalizedCode = countryCode.toLowerCase();
  return items.filter(
    (item) => !item.countries || item.countries.map(c => c.toLowerCase()).includes(normalizedCode)
  );
}

/**
 * Get the region identifier for a given country code
 * @param countryCode - Country code (e.g., 'gb', 'ie', 'GB', 'US')
 * @returns Promise resolving to the region identifier
 */
async function getRegionForCountry(countryCode: string): Promise<string> {
  const regions = await loadRegions();
  const normalizedCode = countryCode.toLowerCase();
  const region = regions.find((r) => r.code === normalizedCode);
  return region?.region || 'uk-ireland';
}

/**
 * Load the list of all available regions
 * @returns Promise resolving to array of Region objects
 */
export async function loadRegions(): Promise<Region[]> {
  return fetchJSON<Region[]>(`${BASE_DATA_PATH}/regions.json`);
}

/**
 * Load country-specific configuration
 * @param countryCode - Country code (e.g., 'gb', 'ie', 'GB', 'US')
 * @returns Promise resolving to RegionConfig object
 */
export async function loadRegionConfig(countryCode: string): Promise<RegionConfig> {
  // Normalize to lowercase for consistent file paths
  const normalizedCode = countryCode.toLowerCase();
  return fetchJSON<RegionConfig>(`${BASE_DATA_PATH}/countries/${normalizedCode}/config.json`);
}

/**
 * Load products data for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to ProductsData object filtered by country
 */
export async function loadProducts(countryCode: string): Promise<ProductsData> {
  const regionId = await getRegionForCountry(countryCode);
  const data = await fetchJSON<ProductsData>(`${BASE_DATA_PATH}/regions/${regionId}/products.json`);

  return {
    products: filterByCountry(data.products, countryCode),
    hotTopics: filterByCountry(data.hotTopics, countryCode),
    quickAccessCards: filterByCountry(data.quickAccessCards, countryCode),
  };
}

/**
 * Load topics/support hubs data for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to TopicsData object filtered by country
 */
export async function loadTopics(countryCode: string): Promise<TopicsData> {
  const regionId = await getRegionForCountry(countryCode);
  const data = await fetchJSON<TopicsData>(`${BASE_DATA_PATH}/regions/${regionId}/topics.json`);

  return {
    supportHubs: filterByCountry(data.supportHubs, countryCode),
  };
}

/**
 * Load articles data for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to ArticlesData object filtered by country
 */
export async function loadArticles(countryCode: string): Promise<ArticlesData> {
  const regionId = await getRegionForCountry(countryCode);
  const data = await fetchJSON<ArticlesData>(`${BASE_DATA_PATH}/regions/${regionId}/articles.json`);

  // Filter articles within each product > topic hierarchy
  const filteredArticles: { [productId: string]: { [topicId: string]: ArticleItem[] } } = {};

  for (const [productId, topics] of Object.entries(data.articles)) {
    filteredArticles[productId] = {};
    for (const [topicId, articles] of Object.entries(topics)) {
      filteredArticles[productId][topicId] = filterByCountry(articles, countryCode);
    }
  }

  return {
    articles: filteredArticles,
  };
}

/**
 * Load contact information for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to ContactData object filtered by country
 */
export async function loadContact(countryCode: string): Promise<ContactData> {
  const regionId = await getRegionForCountry(countryCode);
  const data = await fetchJSON<ContactData>(`${BASE_DATA_PATH}/regions/${regionId}/contact.json`);

  return {
    contactMethods: filterByCountry(data.contactMethods, countryCode),
  };
}

/**
 * Load incident banners for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to IncidentBannersData object filtered by country
 */
export async function loadIncidentBanners(countryCode: string): Promise<IncidentBannersData> {
  const regionId = await getRegionForCountry(countryCode);
  const data = await fetchJSON<IncidentBannersData>(`${BASE_DATA_PATH}/regions/${regionId}/incidents.json`);

  return {
    banners: filterByCountry(data.banners, countryCode),
  };
}

/**
 * Load popup modals for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to PopupsData object filtered by country
 */
export async function loadPopups(countryCode: string): Promise<PopupsData> {
  const regionId = await getRegionForCountry(countryCode);
  const data = await fetchJSON<PopupsData>(`${BASE_DATA_PATH}/regions/${regionId}/popups.json`);

  return {
    popups: filterByCountry(data.popups, countryCode),
  };
}

/**
 * Load release notes for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @param productId - Optional product ID to filter release notes by product
 * @returns Promise resolving to ReleaseNotesData object filtered by country and optionally by product
 */
export async function loadReleaseNotes(countryCode: string, productId?: string): Promise<ReleaseNotesData> {
  const regionId = await getRegionForCountry(countryCode);
  const data = await fetchJSON<ReleaseNotesData>(`${BASE_DATA_PATH}/regions/${regionId}/release-notes.json`);

  // If productId is specified, return only that product's release notes
  if (productId) {
    const productNotes = data.releaseNotes[productId] || [];
    const filteredNotes = filterByCountry(productNotes, countryCode);

    // Sort by date in descending order (newest first)
    filteredNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      releaseNotes: {
        [productId]: filteredNotes,
      },
    };
  }

  // Otherwise return all release notes, filtered by country
  const filteredReleaseNotes: { [productId: string]: typeof data.releaseNotes[string] } = {};

  for (const [pid, notes] of Object.entries(data.releaseNotes)) {
    const filtered = filterByCountry(notes, countryCode);

    // Sort by date in descending order (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (filtered.length > 0) {
      filteredReleaseNotes[pid] = filtered;
    }
  }

  return {
    releaseNotes: filteredReleaseNotes,
  };
}

/**
 * Load all data for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to an object containing all country data
 */
export async function loadAllRegionData(countryCode: string) {
  const [config, products, topics, articles, contact] = await Promise.all([
    loadRegionConfig(countryCode),
    loadProducts(countryCode),
    loadTopics(countryCode),
    loadArticles(countryCode),
    loadContact(countryCode),
  ]);

  return {
    config,
    products,
    topics,
    articles,
    contact,
  };
}

/**
 * Get the default region code
 * @returns Promise resolving to the default region code
 */
export async function getDefaultRegion(): Promise<string> {
  const regions = await loadRegions();
  const defaultRegion = regions.find((r) => r.default);
  return defaultRegion?.code || 'gb';
}
