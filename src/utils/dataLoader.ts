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
  ContactData
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
 * Load the list of all available regions
 * @returns Promise resolving to array of Region objects
 */
export async function loadRegions(): Promise<Region[]> {
  return fetchJSON<Region[]>(`${BASE_DATA_PATH}/regions.json`);
}

/**
 * Load region-specific configuration
 * @param region - Region code (e.g., 'gb', 'ie')
 * @returns Promise resolving to RegionConfig object
 */
export async function loadRegionConfig(region: string): Promise<RegionConfig> {
  return fetchJSON<RegionConfig>(`${BASE_DATA_PATH}/${region}/config.json`);
}

/**
 * Load products data for a specific region
 * @param region - Region code (e.g., 'gb', 'ie')
 * @returns Promise resolving to ProductsData object
 */
export async function loadProducts(region: string): Promise<ProductsData> {
  return fetchJSON<ProductsData>(`${BASE_DATA_PATH}/${region}/products.json`);
}

/**
 * Load topics/support hubs data for a specific region
 * @param region - Region code (e.g., 'gb', 'ie')
 * @returns Promise resolving to TopicsData object
 */
export async function loadTopics(region: string): Promise<TopicsData> {
  return fetchJSON<TopicsData>(`${BASE_DATA_PATH}/${region}/topics.json`);
}

/**
 * Load articles data for a specific region
 * @param region - Region code (e.g., 'gb', 'ie')
 * @returns Promise resolving to ArticlesData object
 */
export async function loadArticles(region: string): Promise<ArticlesData> {
  return fetchJSON<ArticlesData>(`${BASE_DATA_PATH}/${region}/articles.json`);
}

/**
 * Load contact information for a specific region
 * @param region - Region code (e.g., 'gb', 'ie')
 * @returns Promise resolving to ContactData object
 */
export async function loadContact(region: string): Promise<ContactData> {
  return fetchJSON<ContactData>(`${BASE_DATA_PATH}/${region}/contact.json`);
}

/**
 * Load all data for a specific region
 * @param region - Region code (e.g., 'gb', 'ie')
 * @returns Promise resolving to an object containing all region data
 */
export async function loadAllRegionData(region: string) {
  const [config, products, topics, articles, contact] = await Promise.all([
    loadRegionConfig(region),
    loadProducts(region),
    loadTopics(region),
    loadArticles(region),
    loadContact(region),
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
