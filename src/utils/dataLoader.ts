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

const BASE_API_PATH = '/api/public/data';

/**
 * Generic function to fetch JSON data from API
 * @param path - API endpoint path
 * @returns Promise resolving to the parsed JSON data
 */
async function fetchJSON<T>(path: string): Promise<T> {
  console.log(`[fetchJSON] Fetching: ${path}`);
  const response = await fetch(path);

  if (!response.ok) {
    console.error(`[fetchJSON] Failed to fetch ${path}: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }

  // Clone the response so we can read it multiple times if needed
  const clonedResponse = response.clone();

  try {
    const data = await response.json();
    console.log(`[fetchJSON] Success: ${path}`, data);
    return data;
  } catch (error) {
    console.error(`[fetchJSON] JSON parse error for ${path}:`, error);
    const text = await clonedResponse.text();
    console.error(`[fetchJSON] Response was:`, text.substring(0, 200));
    throw error;
  }
}

/**
 * Load the list of all available regions
 * @returns Promise resolving to array of Region objects
 */
export async function loadRegions(): Promise<Region[]> {
  console.log('[dataLoader] Loading regions from API: /api/regions/public');
  const data = await fetchJSON<Region[]>('/api/regions/public');
  console.log('[dataLoader] Loaded regions:', data);
  return data;
}

/**
 * Load country-specific configuration
 * @param countryCode - Country code (e.g., 'gb', 'ie', 'GB', 'US')
 * @returns Promise resolving to RegionConfig object
 */
export async function loadRegionConfig(countryCode: string): Promise<RegionConfig> {
  // Normalize to lowercase for consistent API calls
  const normalizedCode = countryCode.toLowerCase();
  const url = `/api/regions/public/${normalizedCode}/config`;
  console.log(`[dataLoader] Loading config for ${countryCode} from API: ${url}`);
  const data = await fetchJSON<RegionConfig>(url);
  console.log(`[dataLoader] Loaded config for ${countryCode}:`, data);
  return data;
}

/**
 * Load products data for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to ProductsData object filtered by country
 */
export async function loadProducts(countryCode: string): Promise<ProductsData> {
  const normalizedCode = countryCode.toLowerCase();
  console.log(`[dataLoader] Loading products for ${countryCode} from API: ${BASE_API_PATH}/${normalizedCode}/products`);
  const data = await fetchJSON<ProductsData>(`${BASE_API_PATH}/${normalizedCode}/products`);
  console.log(`[dataLoader] Loaded products for ${countryCode}:`, data);
  return data;
}

/**
 * Load topics/support hubs data for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to TopicsData object filtered by country
 */
export async function loadTopics(countryCode: string): Promise<TopicsData> {
  const normalizedCode = countryCode.toLowerCase();
  console.log(`[dataLoader] Loading topics for ${countryCode} from API: ${BASE_API_PATH}/${normalizedCode}/topics`);
  const data = await fetchJSON<TopicsData>(`${BASE_API_PATH}/${normalizedCode}/topics`);
  console.log(`[dataLoader] Loaded topics for ${countryCode}:`, data);
  return data;
}

/**
 * Load articles data for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to ArticlesData object filtered by country
 */
export async function loadArticles(countryCode: string): Promise<ArticlesData> {
  const normalizedCode = countryCode.toLowerCase();
  console.log(`[dataLoader] Loading articles for ${countryCode} from API: ${BASE_API_PATH}/${normalizedCode}/articles`);
  const data = await fetchJSON<ArticlesData>(`${BASE_API_PATH}/${normalizedCode}/articles`);
  console.log(`[dataLoader] Loaded articles for ${countryCode}:`, data);
  return data;
}

/**
 * Load contact information for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to ContactData object filtered by country
 */
export async function loadContact(countryCode: string): Promise<ContactData> {
  const normalizedCode = countryCode.toLowerCase();
  console.log(`[dataLoader] Loading contact for ${countryCode} from API: ${BASE_API_PATH}/${normalizedCode}/contact`);
  const data = await fetchJSON<ContactData>(`${BASE_API_PATH}/${normalizedCode}/contact`);
  console.log(`[dataLoader] Loaded contact for ${countryCode}:`, data);
  return data;
}

/**
 * Load contact information for a specific product
 * Filters contact methods by product and country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @param productId - Product ID (e.g., 'sage-50-accounts')
 * @returns Promise resolving to ContactData object filtered by product and country
 */
export async function loadContactForProduct(countryCode: string, productId: string): Promise<ContactData> {
  const normalizedCode = countryCode.toLowerCase();
  console.log(`[dataLoader] Loading contact for ${countryCode}/${productId} from API: ${BASE_API_PATH}/${normalizedCode}/products/${productId}/contact`);
  const data = await fetchJSON<ContactData>(`${BASE_API_PATH}/${normalizedCode}/products/${productId}/contact`);
  console.log(`[dataLoader] Loaded contact for ${countryCode}/${productId}:`, data);
  return data;
}

/**
 * Load contact information for a specific topic
 * Falls back through: topic-level → product-level → group-level contact
 * Filters by country and product
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @param productFolderId - Product folder ID (e.g., 'sage-50-accounts')
 * @param topicFolderId - Topic folder ID (e.g., 'install-your-software')
 * @returns Promise resolving to ContactData object filtered by topic/product and country
 */
export async function loadContactForTopic(
  countryCode: string,
  productFolderId: string,
  topicFolderId: string
): Promise<ContactData> {
  const normalizedCode = countryCode.toLowerCase();
  console.log(`[dataLoader] Loading contact for ${countryCode}/${productFolderId}/${topicFolderId} from API: ${BASE_API_PATH}/${normalizedCode}/products/${productFolderId}/topics/${topicFolderId}/contact`);

  try {
    const data = await fetchJSON<ContactData>(
      `${BASE_API_PATH}/${normalizedCode}/products/${productFolderId}/topics/${topicFolderId}/contact`
    );
    console.log(`[dataLoader] Loaded contact for ${countryCode}/${productFolderId}/${topicFolderId}:`, data);
    return data;
  } catch (error) {
    console.error(`Failed to load contact for ${productFolderId}/${topicFolderId}:`, error);
    return { contactMethods: [] };
  }
}

/**
 * Load incident banners for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to IncidentBannersData object filtered by country
 */
export async function loadIncidentBanners(countryCode: string): Promise<IncidentBannersData> {
  const normalizedCode = countryCode.toLowerCase();
  console.log(`[dataLoader] Loading incidents for ${countryCode} from API: ${BASE_API_PATH}/${normalizedCode}/incidents`);
  const data = await fetchJSON<IncidentBannersData>(`${BASE_API_PATH}/${normalizedCode}/incidents`);
  console.log(`[dataLoader] Loaded incidents for ${countryCode}:`, data);
  return data;
}

/**
 * Load popup modals for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to PopupsData object filtered by country
 */
export async function loadPopups(countryCode: string): Promise<PopupsData> {
  const normalizedCode = countryCode.toLowerCase();
  console.log(`[dataLoader] Loading popups for ${countryCode} from API: ${BASE_API_PATH}/${normalizedCode}/popups`);
  const data = await fetchJSON<PopupsData>(`${BASE_API_PATH}/${normalizedCode}/popups`);
  console.log(`[dataLoader] Loaded popups for ${countryCode}:`, data);
  return data;
}

/**
 * Load release notes for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @param productId - Optional product ID to filter release notes by product
 * @returns Promise resolving to ReleaseNotesData object filtered by country and optionally by product
 */
export async function loadReleaseNotes(countryCode: string, productId?: string): Promise<ReleaseNotesData> {
  const normalizedCode = countryCode.toLowerCase();

  if (productId) {
    console.log(`[dataLoader] Loading release notes for ${countryCode}/${productId} from API: ${BASE_API_PATH}/${normalizedCode}/release-notes/${productId}`);
    const data = await fetchJSON<ReleaseNotesData>(`${BASE_API_PATH}/${normalizedCode}/release-notes/${productId}`);
    console.log(`[dataLoader] Loaded release notes for ${countryCode}/${productId}:`, data);
    return data;
  }

  console.log(`[dataLoader] Loading release notes for ${countryCode} from API: ${BASE_API_PATH}/${normalizedCode}/release-notes`);
  const data = await fetchJSON<ReleaseNotesData>(`${BASE_API_PATH}/${normalizedCode}/release-notes`);
  console.log(`[dataLoader] Loaded release notes for ${countryCode}:`, data);
  return data;
}

/**
 * Load videos for a specific product and topic
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @param productFolderId - Product folder ID (e.g., 'sage-50-accounts')
 * @param topicFolderId - Topic folder ID (e.g., 'install-your-software')
 * @returns Promise resolving to array of video objects
 */
export async function loadVideos(
  countryCode: string,
  productFolderId: string,
  topicFolderId: string
): Promise<any[]> {
  const normalizedCode = countryCode.toLowerCase();
  console.log(`[dataLoader] Loading videos for ${countryCode}/${productFolderId}/${topicFolderId} from API: ${BASE_API_PATH}/${normalizedCode}/products/${productFolderId}/topics/${topicFolderId}/videos`);

  try {
    const videos = await fetchJSON<any[]>(
      `${BASE_API_PATH}/${normalizedCode}/products/${productFolderId}/topics/${topicFolderId}/videos`
    );
    console.log(`[dataLoader] Loaded videos for ${countryCode}/${productFolderId}/${topicFolderId}:`, videos);
    return videos;
  } catch (error) {
    console.error(`Failed to load videos for ${productFolderId}/${topicFolderId}:`, error);
    return [];
  }
}

/**
 * Load training materials for a specific product and topic
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @param productFolderId - Product folder ID (e.g., 'sage-50-accounts')
 * @param topicFolderId - Topic folder ID (e.g., 'install-your-software')
 * @returns Promise resolving to array of training objects
 */
export async function loadTraining(
  countryCode: string,
  productFolderId: string,
  topicFolderId: string
): Promise<any[]> {
  const normalizedCode = countryCode.toLowerCase();
  console.log(`[dataLoader] Loading training for ${countryCode}/${productFolderId}/${topicFolderId} from API: ${BASE_API_PATH}/${normalizedCode}/products/${productFolderId}/topics/${topicFolderId}/training`);

  try {
    const training = await fetchJSON<any[]>(
      `${BASE_API_PATH}/${normalizedCode}/products/${productFolderId}/topics/${topicFolderId}/training`
    );
    console.log(`[dataLoader] Loaded training for ${countryCode}/${productFolderId}/${topicFolderId}:`, training);
    return training;
  } catch (error) {
    console.error(`Failed to load training for ${productFolderId}/${topicFolderId}:`, error);
    return [];
  }
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
