import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyAuth } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const GROUPS_DIR = path.join(__dirname, '..', '..', 'public', 'data', 'groups');

/**
 * POST /api/products/:groupId
 * Create a new product in a group
 */
router.post('/:groupId', verifyAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const productData = req.body;

    // Validation
    if (!productData.id || !productData.name) {
      return res.status(400).json({ error: 'Product ID and name are required' });
    }

    // Generate product folder ID from product ID
    const productFolderId = productData.id.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if product folder already exists
    const productDir = path.join(GROUPS_DIR, groupId, 'products', productFolderId);
    try {
      await fs.access(productDir);
      return res.status(400).json({ error: 'Product already exists' });
    } catch {
      // Product doesn't exist, continue
    }

    // Create product directory
    await fs.mkdir(productDir, { recursive: true });

    // Create topics directory
    const topicsDir = path.join(productDir, 'topics');
    await fs.mkdir(topicsDir, { recursive: true });

    // Create product config
    const productConfig = {
      id: productData.id,
      name: productData.name,
      description: productData.description || '',
      type: productData.type || 'cloud',
      personas: productData.personas || ['customer', 'accountant'],
      categories: productData.categories || [],
      countries: productData.countries || [],
      icon: productData.icon || '',
      knowledgebase_collection: productData.knowledgebase_collection || '',
      topicIds: [],
    };

    const configPath = path.join(productDir, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(productConfig, null, 2));

    // Create release-notes.json
    const releaseNotesPath = path.join(productDir, 'release-notes.json');
    await fs.writeFile(releaseNotesPath, JSON.stringify([], null, 2));

    // Update group config to add productId
    const groupConfigPath = path.join(GROUPS_DIR, groupId, 'config.json');
    const groupConfigContent = await fs.readFile(groupConfigPath, 'utf-8');
    const groupConfig = JSON.parse(groupConfigContent);

    if (!groupConfig.productIds) {
      groupConfig.productIds = [];
    }

    if (!groupConfig.productIds.includes(productFolderId)) {
      groupConfig.productIds.push(productFolderId);
    }

    // Create backup
    const backupPath = `${groupConfigPath}.backup-${Date.now()}`;
    await fs.writeFile(backupPath, groupConfigContent);

    // Write updated group config
    await fs.writeFile(groupConfigPath, JSON.stringify(groupConfig, null, 2));

    res.json({
      success: true,
      message: 'Product created successfully',
      product: productConfig,
      productFolderId,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

/**
 * PUT /api/products/:groupId/:productFolderId
 * Update an existing product
 */
router.put('/:groupId/:productFolderId', verifyAuth, async (req, res) => {
  try {
    const { groupId, productFolderId } = req.params;
    const productData = req.body;

    const productConfigPath = path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json');

    // Read existing config
    const existingContent = await fs.readFile(productConfigPath, 'utf-8');
    const existingConfig = JSON.parse(existingContent);

    // Merge with new data
    const updatedConfig = {
      ...existingConfig,
      ...productData,
    };

    // Create backup
    const backupPath = `${productConfigPath}.backup-${Date.now()}`;
    await fs.writeFile(backupPath, existingContent);

    // Write updated config
    await fs.writeFile(productConfigPath, JSON.stringify(updatedConfig, null, 2));

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedConfig,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * GET /api/products/:groupId/:productFolderId
 * Get a single product's config
 */
router.get('/:groupId/:productFolderId', verifyAuth, async (req, res) => {
  try {
    const { groupId, productFolderId } = req.params;

    const productConfigPath = path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json');
    const configContent = await fs.readFile(productConfigPath, 'utf-8');
    const config = JSON.parse(configContent);

    res.json({
      success: true,
      product: config,
    });
  } catch (error) {
    console.error('Error loading product:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Failed to load product' });
  }
});

/**
 * GET /api/products/:groupId/:productFolderId/topics
 * Get all topics for a product
 */
router.get('/:groupId/:productFolderId/topics', verifyAuth, async (req, res) => {
  try {
    const { groupId, productFolderId } = req.params;

    // Read product config to get topicIds
    const productConfigPath = path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json');
    const productContent = await fs.readFile(productConfigPath, 'utf-8');
    const productConfig = JSON.parse(productContent);

    const topicIds = productConfig.topicIds || [];
    const supportHubs = [];

    // Load each topic's config
    for (const topicFolderId of topicIds) {
      try {
        const topicConfigPath = path.join(
          GROUPS_DIR,
          groupId,
          'products',
          productFolderId,
          'topics',
          topicFolderId,
          'config.json'
        );
        const topicContent = await fs.readFile(topicConfigPath, 'utf-8');
        const topicConfig = JSON.parse(topicContent);
        supportHubs.push({
          ...topicConfig,
          productId: productConfig.id,
        });
      } catch (error) {
        console.error(`Failed to load topic ${topicFolderId}:`, error);
      }
    }

    res.json({
      success: true,
      data: {
        supportHubs,
      },
    });
  } catch (error) {
    console.error('Error loading topics:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Failed to load topics' });
  }
});

/**
 * PUT /api/products/:groupId/:productFolderId/topics
 * Update topics for a product (create/update/delete topic configs and update topicIds in product config)
 */
router.put('/:groupId/:productFolderId/topics', verifyAuth, async (req, res) => {
  try {
    const { groupId, productFolderId } = req.params;
    const { data } = req.body;

    if (!data || !data.supportHubs) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const productDir = path.join(GROUPS_DIR, groupId, 'products', productFolderId);
    const topicsDir = path.join(productDir, 'topics');
    const productConfigPath = path.join(productDir, 'config.json');

    // Read existing product config
    const productContent = await fs.readFile(productConfigPath, 'utf-8');
    const productConfig = JSON.parse(productContent);

    // Filter topics for this product only
    const productTopics = data.supportHubs.filter(
      (topic) => topic.productId === productConfig.id
    );

    // Generate topic folder IDs from topic IDs
    const topicFolderIds = productTopics.map((topic) =>
      topic.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    );

    // Get existing topic folders to determine what needs to be deleted
    let existingTopicFolders = [];
    try {
      const topicsDirContents = await fs.readdir(topicsDir, { withFileTypes: true });
      existingTopicFolders = topicsDirContents
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
    } catch (error) {
      // Topics directory might not exist yet
      await fs.mkdir(topicsDir, { recursive: true });
    }

    // Delete topics that are no longer in the list
    for (const existingFolder of existingTopicFolders) {
      if (!topicFolderIds.includes(existingFolder)) {
        const folderPath = path.join(topicsDir, existingFolder);
        await fs.rm(folderPath, { recursive: true, force: true });
        console.log(`Deleted topic folder: ${existingFolder}`);
      }
    }

    // Create/update topic configs
    for (const topic of productTopics) {
      const topicFolderId = topic.id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const topicDir = path.join(topicsDir, topicFolderId);
      const topicConfigPath = path.join(topicDir, 'config.json');

      // Create topic directory if it doesn't exist
      await fs.mkdir(topicDir, { recursive: true });

      // Prepare topic config (remove productId as it's inferred from folder structure)
      const { productId, ...topicConfig } = topic;

      // Create backup if file exists
      try {
        const existingContent = await fs.readFile(topicConfigPath, 'utf-8');
        const backupPath = `${topicConfigPath}.backup-${Date.now()}`;
        await fs.writeFile(backupPath, existingContent);
      } catch (error) {
        // File doesn't exist yet, no backup needed
      }

      // Write topic config
      await fs.writeFile(topicConfigPath, JSON.stringify(topicConfig, null, 2));

      // Create articles.json if it doesn't exist
      const articlesPath = path.join(topicDir, 'articles.json');
      try {
        await fs.access(articlesPath);
      } catch {
        await fs.writeFile(articlesPath, JSON.stringify([], null, 2));
      }
    }

    // Update product config with new topicIds
    const backupPath = `${productConfigPath}.backup-${Date.now()}`;
    await fs.writeFile(backupPath, productContent);

    productConfig.topicIds = topicFolderIds;
    await fs.writeFile(productConfigPath, JSON.stringify(productConfig, null, 2));

    res.json({
      success: true,
      message: 'Topics updated successfully',
    });
  } catch (error) {
    console.error('Error updating topics:', error);
    res.status(500).json({ error: 'Failed to update topics' });
  }
});

/**
 * GET /api/products/:groupId/:productFolderId/articles
 * Get all articles for all topics in a product
 */
router.get('/:groupId/:productFolderId/articles', verifyAuth, async (req, res) => {
  try {
    const { groupId, productFolderId } = req.params;

    // Read product config to get productId and topicIds
    const productConfigPath = path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json');
    const productContent = await fs.readFile(productConfigPath, 'utf-8');
    const productConfig = JSON.parse(productContent);

    const topicIds = productConfig.topicIds || [];
    const articles = {};

    // Initialize articles object for this product
    articles[productConfig.id] = {};

    // Load articles for each topic
    for (const topicFolderId of topicIds) {
      try {
        // Get topic ID from config
        const topicConfigPath = path.join(
          GROUPS_DIR,
          groupId,
          'products',
          productFolderId,
          'topics',
          topicFolderId,
          'config.json'
        );
        const topicContent = await fs.readFile(topicConfigPath, 'utf-8');
        const topicConfig = JSON.parse(topicContent);

        // Load articles
        const articlesPath = path.join(
          GROUPS_DIR,
          groupId,
          'products',
          productFolderId,
          'topics',
          topicFolderId,
          'articles.json'
        );
        const articlesContent = await fs.readFile(articlesPath, 'utf-8');
        const topicArticles = JSON.parse(articlesContent);

        articles[productConfig.id][topicConfig.id] = topicArticles;
      } catch (error) {
        console.error(`Failed to load articles for topic ${topicFolderId}:`, error);
      }
    }

    res.json({
      success: true,
      data: {
        articles,
      },
    });
  } catch (error) {
    console.error('Error loading articles:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

/**
 * DELETE /api/products/:groupId/:productFolderId
 * Delete a product
 */
router.delete('/:groupId/:productFolderId', verifyAuth, async (req, res) => {
  try {
    const { groupId, productFolderId } = req.params;

    // Remove product folder
    const productDir = path.join(GROUPS_DIR, groupId, 'products', productFolderId);
    await fs.rm(productDir, { recursive: true, force: true });

    // Update group config to remove productId
    const groupConfigPath = path.join(GROUPS_DIR, groupId, 'config.json');
    const groupConfigContent = await fs.readFile(groupConfigPath, 'utf-8');
    const groupConfig = JSON.parse(groupConfigContent);

    if (groupConfig.productIds) {
      groupConfig.productIds = groupConfig.productIds.filter(id => id !== productFolderId);
    }

    // Create backup
    const backupPath = `${groupConfigPath}.backup-${Date.now()}`;
    await fs.writeFile(backupPath, groupConfigContent);

    // Write updated group config
    await fs.writeFile(groupConfigPath, JSON.stringify(groupConfig, null, 2));

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
