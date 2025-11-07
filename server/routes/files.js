import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyAuth } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Base path to data files
const DATA_BASE_PATH = path.join(__dirname, '..', '..', 'public', 'data');
const GROUPS_DIR = path.join(DATA_BASE_PATH, 'groups');

// Valid file types for groups
const VALID_FILE_TYPES = [
  'products',
  'incidents',
  'popups',
  'contact',
  'config',
];

/**
 * Helper function to get file path
 * Supports both static files (like regions.json) and group-specific files
 * Format: {groupId}-{fileType} (e.g., uki-products, north-america-incidents)
 */
function getFilePath(fileId) {
  // Handle special case for regions.json
  if (fileId === 'regions') {
    return path.join(DATA_BASE_PATH, 'regions.json');
  }

  // Parse group-specific file ID
  // Format: {groupId}-{fileType}
  const parts = fileId.split('-');
  if (parts.length < 2) {
    return null;
  }

  // The last part is the file type, everything before is the groupId
  const fileType = parts[parts.length - 1];
  const groupId = parts.slice(0, -1).join('-');

  // Validate file type
  if (!VALID_FILE_TYPES.includes(fileType)) {
    return null;
  }

  // For products, return special marker (will be handled separately)
  if (fileType === 'products') {
    return { type: 'products', groupId };
  }

  // For other types, return path to group-level file
  return path.join(GROUPS_DIR, groupId, `${fileType}.json`);
}

// Get list of available files (deprecated - kept for backwards compatibility)
router.get('/list', verifyAuth, async (req, res, next) => {
  try {
    // This endpoint is deprecated but kept for backwards compatibility
    // In the new system, file paths are dynamically generated
    const files = [
      { id: 'regions', name: 'Regions', path: getFilePath('regions') }
    ];

    res.json({ files });
  } catch (error) {
    next(error);
  }
});

// Get a specific file
router.get('/:fileId', verifyAuth, async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const filePathOrMarker = getFilePath(fileId);

    if (!filePathOrMarker) {
      return res.status(400).json({ error: 'Invalid file ID format' });
    }

    // Handle products specially - aggregate from individual product folders
    if (typeof filePathOrMarker === 'object' && filePathOrMarker.type === 'products') {
      const { groupId } = filePathOrMarker;

      // Read group config to get productIds
      const groupConfigPath = path.join(GROUPS_DIR, groupId, 'config.json');
      const groupConfigContent = await fs.readFile(groupConfigPath, 'utf-8');
      const groupConfig = JSON.parse(groupConfigContent);

      // Load each product's config
      const products = [];
      for (const productFolderId of groupConfig.productIds || []) {
        try {
          const productConfigPath = path.join(GROUPS_DIR, groupId, 'products', productFolderId, 'config.json');
          const productContent = await fs.readFile(productConfigPath, 'utf-8');
          const productConfig = JSON.parse(productContent);
          products.push(productConfig);
        } catch (err) {
          console.error(`Error loading product ${productFolderId}:`, err);
        }
      }

      return res.json({
        fileId,
        data: {
          products,
          quickAccessCards: groupConfig.quickAccessCards || [],
        },
        path: groupConfigPath
      });
    }

    // For other file types, read normally
    const content = await fs.readFile(filePathOrMarker, 'utf-8');
    const data = JSON.parse(content);

    res.json({
      fileId,
      data,
      path: filePathOrMarker
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    next(error);
  }
});

// Update a specific file
router.put('/:fileId', verifyAuth, async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { data } = req.body;
    const filePath = getFilePath(fileId);

    if (!filePath) {
      return res.status(400).json({ error: 'Invalid file ID format' });
    }

    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Validate JSON structure
    try {
      JSON.parse(JSON.stringify(data));
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON data' });
    }

    // Create backup before writing
    const backupPath = filePath + '.backup';
    try {
      const existingContent = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(backupPath, existingContent, 'utf-8');
    } catch (err) {
      console.warn('Could not create backup:', err.message);
    }

    // Write the new data with pretty formatting
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString + '\n', 'utf-8');

    res.json({
      success: true,
      message: 'File updated successfully',
      fileId,
      path: filePath
    });
  } catch (error) {
    next(error);
  }
});

export default router;
