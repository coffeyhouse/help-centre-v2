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
 * Get the group identifier for a given country code
 * @param countryCode - Country code (e.g., 'gb', 'ie', 'GB', 'US')
 * @returns Promise resolving to the group identifier
 */
async function getGroupForCountry(countryCode: string): Promise<string> {
  const regions = await loadRegions();
  const normalizedCode = countryCode.toLowerCase();
  const region = regions.find((r) => r.code === normalizedCode);
  // Map old region names to new group names
  const regionToGroupMap: Record<string, string> = {
    'uk-ireland': 'uki',
    'north-america': 'north-america',
  };
  return regionToGroupMap[region?.region || 'uk-ireland'] || 'uki';
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
  const groupId = await getGroupForCountry(countryCode);

  // Load group config to get productIds and quickAccessCards
  const groupConfig = await fetchJSON<{
    id: string;
    name: string;
    productIds: string[];
    quickAccessCards: any[];
  }>(`${BASE_DATA_PATH}/groups/${groupId}/config.json`);

  // Load each product's config
  const products = await Promise.all(
    groupConfig.productIds.map(async (productFolderId) => {
      try {
        return await fetchJSON<any>(
          `${BASE_DATA_PATH}/groups/${groupId}/products/${productFolderId}/config.json`
        );
      } catch (error) {
        console.error(`Failed to load product ${productFolderId}:`, error);
        return null;
      }
    })
  );

  // Filter out null products and filter by country
  const validProducts = products.filter((p) => p !== null);

  return {
    products: filterByCountry(validProducts, countryCode),
    quickAccessCards: filterByCountry(groupConfig.quickAccessCards, countryCode),
  };
}

/**
 * Load topics/support hubs data for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to TopicsData object filtered by country
 */
export async function loadTopics(countryCode: string): Promise<TopicsData> {
  const groupId = await getGroupForCountry(countryCode);

  // Load group config to get productIds
  const groupConfig = await fetchJSON<{
    productIds: string[];
  }>(`${BASE_DATA_PATH}/groups/${groupId}/config.json`);

  const allTopics: any[] = [];

  // For each product, load its topics
  for (const productFolderId of groupConfig.productIds) {
    try {
      const productConfig = await fetchJSON<{ id: string; topicIds?: string[] }>(
        `${BASE_DATA_PATH}/groups/${groupId}/products/${productFolderId}/config.json`
      );

      if (productConfig.topicIds) {
        // Load each topic's config
        const topicConfigs = await Promise.all(
          productConfig.topicIds.map(async (topicFolderId) => {
            try {
              const topicConfig = await fetchJSON<any>(
                `${BASE_DATA_PATH}/groups/${groupId}/products/${productFolderId}/topics/${topicFolderId}/config.json`
              );
              // Add productId to the topic (it's stored in the folder structure)
              return {
                ...topicConfig,
                productId: productConfig.id,
              };
            } catch (error) {
              console.error(`Failed to load topic ${topicFolderId}:`, error);
              return null;
            }
          })
        );

        // Filter out null topics
        allTopics.push(...topicConfigs.filter((t) => t !== null));
      }
    } catch (error) {
      console.error(`Failed to load product ${productFolderId} for topics:`, error);
    }
  }

  return {
    supportHubs: filterByCountry(allTopics, countryCode),
  };
}

/**
 * Load articles data for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to ArticlesData object filtered by country
 */
export async function loadArticles(countryCode: string): Promise<ArticlesData> {
  const groupId = await getGroupForCountry(countryCode);

  // Load group config to get productIds
  const groupConfig = await fetchJSON<{
    productIds: string[];
  }>(`${BASE_DATA_PATH}/groups/${groupId}/config.json`);

  const allArticles: { [productId: string]: { [topicId: string]: ArticleItem[] } } = {};

  // For each product, load its articles
  for (const productFolderId of groupConfig.productIds) {
    try {
      const productConfig = await fetchJSON<{ id: string; topicIds?: string[] }>(
        `${BASE_DATA_PATH}/groups/${groupId}/products/${productFolderId}/config.json`
      );

      if (productConfig.topicIds) {
        allArticles[productConfig.id] = {};

        // Load articles for each topic
        for (const topicFolderId of productConfig.topicIds) {
          try {
            const topicConfig = await fetchJSON<{ id: string }>(
              `${BASE_DATA_PATH}/groups/${groupId}/products/${productFolderId}/topics/${topicFolderId}/config.json`
            );

            const articles = await fetchJSON<ArticleItem[]>(
              `${BASE_DATA_PATH}/groups/${groupId}/products/${productFolderId}/topics/${topicFolderId}/articles.json`
            );

            allArticles[productConfig.id][topicConfig.id] = filterByCountry(articles, countryCode);
          } catch (error) {
            console.error(`Failed to load articles for topic ${topicFolderId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to load product ${productFolderId} for articles:`, error);
    }
  }

  return {
    articles: allArticles,
  };
}

/**
 * Load contact information for a specific country
 * @param countryCode - Country code (e.g., 'gb', 'ie')
 * @returns Promise resolving to ContactData object filtered by country
 */
export async function loadContact(countryCode: string): Promise<ContactData> {
  const groupId = await getGroupForCountry(countryCode);
  const data = await fetchJSON<ContactData>(`${BASE_DATA_PATH}/groups/${groupId}/contact.json`);

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
  const groupId = await getGroupForCountry(countryCode);
  const data = await fetchJSON<IncidentBannersData>(`${BASE_DATA_PATH}/groups/${groupId}/incidents.json`);

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
  const groupId = await getGroupForCountry(countryCode);
  const data = await fetchJSON<PopupsData>(`${BASE_DATA_PATH}/groups/${groupId}/popups.json`);

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
  const groupId = await getGroupForCountry(countryCode);

  // Load group config to get productIds
  const groupConfig = await fetchJSON<{
    productIds: string[];
  }>(`${BASE_DATA_PATH}/groups/${groupId}/config.json`);

  const allReleaseNotes: { [productId: string]: any[] } = {};

  // For each product, load its release notes
  for (const productFolderId of groupConfig.productIds) {
    try {
      const productConfig = await fetchJSON<{ id: string }>(
        `${BASE_DATA_PATH}/groups/${groupId}/products/${productFolderId}/config.json`
      );

      // Load release notes for this product
      try {
        const releaseNotes = await fetchJSON<any[]>(
          `${BASE_DATA_PATH}/groups/${groupId}/products/${productFolderId}/release-notes.json`
        );

        const filteredNotes = filterByCountry(releaseNotes, countryCode);

        // Sort by date in descending order (newest first)
        filteredNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (filteredNotes.length > 0) {
          allReleaseNotes[productConfig.id] = filteredNotes;
        }
      } catch (error) {
        // Release notes might not exist for all products
        console.debug(`No release notes found for product ${productFolderId}`);
      }
    } catch (error) {
      console.error(`Failed to load product ${productFolderId} for release notes:`, error);
    }
  }

  // If productId is specified, return only that product's release notes
  if (productId) {
    return {
      releaseNotes: {
        [productId]: allReleaseNotes[productId] || [],
      },
    };
  }

  return {
    releaseNotes: allReleaseNotes,
  };
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
  const groupId = await getGroupForCountry(countryCode);

  try {
    const videos = await fetchJSON<any[]>(
      `${BASE_DATA_PATH}/groups/${groupId}/products/${productFolderId}/topics/${topicFolderId}/videos.json`
    );

    return filterByCountry(videos, countryCode);
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
  const groupId = await getGroupForCountry(countryCode);

  try {
    const training = await fetchJSON<any[]>(
      `${BASE_DATA_PATH}/groups/${groupId}/products/${productFolderId}/topics/${topicFolderId}/training.json`
    );

    return filterByCountry(training, countryCode);
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
