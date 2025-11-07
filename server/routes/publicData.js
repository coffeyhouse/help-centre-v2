import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const GROUPS_DIR = path.join(__dirname, '..', '..', 'public', 'data', 'groups');

/**
 * Helper function to filter items by country
 * If an item has no countries field, it applies to all countries
 * @param {Array} items - Array of items with optional countries field
 * @param {string} countryCode - Country code to filter by
 * @returns {Array} Filtered array of items
 */
function filterByCountry(items, countryCode) {
  if (!Array.isArray(items)) return items;

  const normalizedCode = countryCode.toLowerCase();
  return items.filter(
    (item) => !item.countries || item.countries.map(c => c.toLowerCase()).includes(normalizedCode)
  );
}

/**
 * Helper function to get the group identifier for a given country code
 * @param {string} countryCode - Country code (e.g., 'gb', 'ie', 'GB', 'US')
 * @returns {Promise<string>} Group identifier
 */
async function getGroupForCountry(countryCode) {
  const normalizedCode = countryCode.toLowerCase();

  // Read all group folders to find which contains this country
  const groupFolders = await fs.readdir(GROUPS_DIR, { withFileTypes: true });

  for (const folder of groupFolders) {
    if (!folder.isDirectory()) continue;

    const groupId = folder.name;
    const configPath = path.join(GROUPS_DIR, groupId, 'config.json');

    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);

      // Check if this group contains the requested country
      const hasCountry = (config.countries || []).some(
        (c) => c.code.toLowerCase() === normalizedCode
      );

      if (hasCountry) {
        return groupId;
      }
    } catch (error) {
      console.error(`Error reading group config for ${groupId}:`, error);
    }
  }

  // Default to 'uki' if country not found
  console.warn(`Country ${countryCode} not found in any group, defaulting to 'uki'`);
  return 'uki';
}

/**
 * Helper function to read and parse JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<any>} Parsed JSON data
 */
async function readJSONFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Middleware to add cache control headers for public data
 */
function addCacheHeaders(req, res, next) {
  // Cache for 5 minutes in browser, can be stale for up to 1 hour
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  next();
}

// Apply cache headers to all routes
router.use(addCacheHeaders);

/**
 * GET /api/public/data/:country/products
 * Get all products for a country
 */
router.get('/:country/products', async (req, res) => {
  try {
    const { country } = req.params;
    const groupId = await getGroupForCountry(country);

    // Load group config to get productIds and quickAccessCards
    const groupConfig = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'config.json')
    );

    // Load each product's config
    const products = await Promise.all(
      groupConfig.productIds.map(async (productFolderId) => {
        try {
          return await readJSONFile(
            path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json')
          );
        } catch (error) {
          console.error(`Failed to load product ${productFolderId}:`, error);
          return null;
        }
      })
    );

    // Filter out null products and filter by country
    const validProducts = products.filter((p) => p !== null);

    res.json({
      products: filterByCountry(validProducts, country),
      quickAccessCards: filterByCountry(groupConfig.quickAccessCards || [], country),
    });
  } catch (error) {
    console.error(`Error loading products for ${req.params.country}:`, error);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

/**
 * GET /api/public/data/:country/products/:productId
 * Get a specific product configuration
 */
router.get('/:country/products/:productId', async (req, res) => {
  try {
    const { country, productId } = req.params;
    const groupId = await getGroupForCountry(country);

    // Load group config to find product folder
    const groupConfig = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'config.json')
    );

    // Find the product folder that matches the productId
    for (const productFolderId of groupConfig.productIds) {
      try {
        const productConfig = await readJSONFile(
          path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json')
        );

        if (productConfig.id === productId) {
          // Check if product applies to this country
          if (!productConfig.countries ||
              productConfig.countries.map(c => c.toLowerCase()).includes(country.toLowerCase())) {
            return res.json(productConfig);
          } else {
            return res.status(404).json({ error: 'Product not available for this country' });
          }
        }
      } catch (error) {
        console.error(`Failed to load product ${productFolderId}:`, error);
      }
    }

    res.status(404).json({ error: 'Product not found' });
  } catch (error) {
    console.error(`Error loading product ${req.params.productId}:`, error);
    res.status(500).json({ error: 'Failed to load product' });
  }
});

/**
 * GET /api/public/data/:country/topics
 * Get all topics for a country
 */
router.get('/:country/topics', async (req, res) => {
  try {
    const { country } = req.params;
    const groupId = await getGroupForCountry(country);

    // Load group config to get productIds
    const groupConfig = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'config.json')
    );

    const allTopics = [];

    // For each product, load its topics
    for (const productFolderId of groupConfig.productIds) {
      try {
        const productConfig = await readJSONFile(
          path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json')
        );

        if (productConfig.topicIds) {
          // Load each topic's config
          const topicConfigs = await Promise.all(
            productConfig.topicIds.map(async (topicFolderId) => {
              try {
                const topicConfig = await readJSONFile(
                  path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'topics', topicFolderId, 'config.json')
                );
                // Add productId to the topic
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

    res.json({
      supportHubs: filterByCountry(allTopics, country),
    });
  } catch (error) {
    console.error(`Error loading topics for ${req.params.country}:`, error);
    res.status(500).json({ error: 'Failed to load topics' });
  }
});

/**
 * GET /api/public/data/:country/products/:productFolderId/topics
 * Get topics for a specific product
 */
router.get('/:country/products/:productFolderId/topics', async (req, res) => {
  try {
    const { country, productFolderId } = req.params;
    const groupId = await getGroupForCountry(country);

    const productConfig = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json')
    );

    if (!productConfig.topicIds) {
      return res.json({ topics: [] });
    }

    // Load each topic's config
    const topics = await Promise.all(
      productConfig.topicIds.map(async (topicFolderId) => {
        try {
          const topicConfig = await readJSONFile(
            path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'topics', topicFolderId, 'config.json')
          );
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

    res.json({
      topics: filterByCountry(topics.filter(t => t !== null), country),
    });
  } catch (error) {
    console.error(`Error loading topics for product ${req.params.productFolderId}:`, error);
    res.status(500).json({ error: 'Failed to load topics' });
  }
});

/**
 * GET /api/public/data/:country/products/:productFolderId/topics/:topicFolderId/articles
 * Get articles for a specific topic
 */
router.get('/:country/products/:productFolderId/topics/:topicFolderId/articles', async (req, res) => {
  try {
    const { country, productFolderId, topicFolderId } = req.params;
    const groupId = await getGroupForCountry(country);

    const articles = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'topics', topicFolderId, 'articles.json')
    );

    res.json(filterByCountry(articles, country));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json([]);
    }
    console.error(`Error loading articles for ${req.params.productFolderId}/${req.params.topicFolderId}:`, error);
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

/**
 * GET /api/public/data/:country/products/:productFolderId/topics/:topicFolderId/videos
 * Get videos for a specific topic
 */
router.get('/:country/products/:productFolderId/topics/:topicFolderId/videos', async (req, res) => {
  try {
    const { country, productFolderId, topicFolderId } = req.params;
    const groupId = await getGroupForCountry(country);

    const videos = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'topics', topicFolderId, 'videos.json')
    );

    res.json(filterByCountry(videos, country));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json([]);
    }
    console.error(`Error loading videos for ${req.params.productFolderId}/${req.params.topicFolderId}:`, error);
    res.status(500).json({ error: 'Failed to load videos' });
  }
});

/**
 * GET /api/public/data/:country/products/:productFolderId/topics/:topicFolderId/training
 * Get training materials for a specific topic
 */
router.get('/:country/products/:productFolderId/topics/:topicFolderId/training', async (req, res) => {
  try {
    const { country, productFolderId, topicFolderId } = req.params;
    const groupId = await getGroupForCountry(country);

    const training = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'topics', topicFolderId, 'training.json')
    );

    res.json(filterByCountry(training, country));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json([]);
    }
    console.error(`Error loading training for ${req.params.productFolderId}/${req.params.topicFolderId}:`, error);
    res.status(500).json({ error: 'Failed to load training' });
  }
});

/**
 * GET /api/public/data/:country/articles
 * Get all articles for a country (organized by product and topic)
 */
router.get('/:country/articles', async (req, res) => {
  try {
    const { country } = req.params;
    const groupId = await getGroupForCountry(country);

    // Load group config to get productIds
    const groupConfig = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'config.json')
    );

    const allArticles = {};

    // For each product, load its articles
    for (const productFolderId of groupConfig.productIds) {
      try {
        const productConfig = await readJSONFile(
          path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json')
        );

        if (productConfig.topicIds) {
          allArticles[productConfig.id] = {};

          // Load articles for each topic
          for (const topicFolderId of productConfig.topicIds) {
            try {
              const topicConfig = await readJSONFile(
                path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'topics', topicFolderId, 'config.json')
              );

              const articles = await readJSONFile(
                path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'topics', topicFolderId, 'articles.json')
              );

              allArticles[productConfig.id][topicConfig.id] = filterByCountry(articles, country);
            } catch (error) {
              // Articles might not exist for all topics
              console.debug(`No articles found for topic ${topicFolderId}`);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to load product ${productFolderId} for articles:`, error);
      }
    }

    res.json({
      articles: allArticles,
    });
  } catch (error) {
    console.error(`Error loading articles for ${req.params.country}:`, error);
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

/**
 * GET /api/public/data/:country/release-notes
 * Get all release notes for a country
 */
router.get('/:country/release-notes', async (req, res) => {
  try {
    const { country } = req.params;
    const groupId = await getGroupForCountry(country);

    // Load group config to get productIds
    const groupConfig = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'config.json')
    );

    const allReleaseNotes = {};

    // For each product, load its release notes
    for (const productFolderId of groupConfig.productIds) {
      try {
        const productConfig = await readJSONFile(
          path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json')
        );

        // Load release notes for this product
        try {
          const releaseNotes = await readJSONFile(
            path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'release-notes.json')
          );

          const filteredNotes = filterByCountry(releaseNotes, country);

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

    res.json({
      releaseNotes: allReleaseNotes,
    });
  } catch (error) {
    console.error(`Error loading release notes for ${req.params.country}:`, error);
    res.status(500).json({ error: 'Failed to load release notes' });
  }
});

/**
 * GET /api/public/data/:country/release-notes/:productId
 * Get release notes for a specific product
 */
router.get('/:country/release-notes/:productId', async (req, res) => {
  try {
    const { country, productId } = req.params;
    const groupId = await getGroupForCountry(country);

    // Load group config to find product folder
    const groupConfig = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'config.json')
    );

    // Find the product folder that matches the productId
    for (const productFolderId of groupConfig.productIds) {
      try {
        const productConfig = await readJSONFile(
          path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json')
        );

        if (productConfig.id === productId) {
          const releaseNotes = await readJSONFile(
            path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'release-notes.json')
          );

          const filteredNotes = filterByCountry(releaseNotes, country);

          // Sort by date in descending order (newest first)
          filteredNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          return res.json({
            releaseNotes: {
              [productId]: filteredNotes,
            },
          });
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          // Release notes file doesn't exist for this product
          console.debug(`No release notes found for product ${productFolderId}`);
        } else {
          console.error(`Failed to load product ${productFolderId}:`, error);
        }
      }
    }

    // Product not found or has no release notes
    res.json({
      releaseNotes: {
        [productId]: [],
      },
    });
  } catch (error) {
    console.error(`Error loading release notes for product ${req.params.productId}:`, error);
    res.status(500).json({ error: 'Failed to load release notes' });
  }
});

/**
 * GET /api/public/data/:country/contact
 * Get contact information for a country
 */
router.get('/:country/contact', async (req, res) => {
  try {
    const { country } = req.params;
    const groupId = await getGroupForCountry(country);

    const data = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'contact.json')
    );

    res.json({
      contactMethods: filterByCountry(data.contactMethods || [], country),
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json({ contactMethods: [] });
    }
    console.error(`Error loading contact for ${req.params.country}:`, error);
    res.status(500).json({ error: 'Failed to load contact information' });
  }
});

/**
 * GET /api/public/data/:country/incidents
 * Get incident banners for a country
 */
router.get('/:country/incidents', async (req, res) => {
  try {
    const { country } = req.params;
    const groupId = await getGroupForCountry(country);

    const data = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'incidents.json')
    );

    res.json({
      banners: filterByCountry(data.banners || [], country),
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json({ banners: [] });
    }
    console.error(`Error loading incidents for ${req.params.country}:`, error);
    res.status(500).json({ error: 'Failed to load incidents' });
  }
});

/**
 * GET /api/public/data/:country/popups
 * Get popup modals for a country
 */
router.get('/:country/popups', async (req, res) => {
  try {
    const { country } = req.params;
    const groupId = await getGroupForCountry(country);

    const data = await readJSONFile(
      path.join(GROUPS_DIR, groupId, 'popups.json')
    );

    res.json({
      popups: filterByCountry(data.popups || [], country),
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json({ popups: [] });
    }
    console.error(`Error loading popups for ${req.params.country}:`, error);
    res.status(500).json({ error: 'Failed to load popups' });
  }
});

export default router;
