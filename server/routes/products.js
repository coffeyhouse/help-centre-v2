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
