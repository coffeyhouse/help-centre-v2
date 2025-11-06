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

// File mappings for valid file types
const FILE_PATHS = {
  regions: path.join(DATA_BASE_PATH, 'regions.json'),
  'uk-ireland-products': path.join(DATA_BASE_PATH, 'regions', 'uk-ireland', 'products.json'),
  'uk-ireland-articles': path.join(DATA_BASE_PATH, 'regions', 'uk-ireland', 'articles.json'),
  'uk-ireland-topics': path.join(DATA_BASE_PATH, 'regions', 'uk-ireland', 'topics.json'),
  'uk-ireland-incidents': path.join(DATA_BASE_PATH, 'regions', 'uk-ireland', 'incidents.json'),
  'uk-ireland-popups': path.join(DATA_BASE_PATH, 'regions', 'uk-ireland', 'popups.json'),
  'uk-ireland-contact': path.join(DATA_BASE_PATH, 'regions', 'uk-ireland', 'contact.json'),
  'uk-ireland-release-notes': path.join(DATA_BASE_PATH, 'regions', 'uk-ireland', 'release-notes.json'),
};

// Get list of available files
router.get('/list', verifyAuth, async (req, res, next) => {
  try {
    const files = Object.keys(FILE_PATHS).map(key => ({
      id: key,
      name: key.replace(/-/g, ' ').replace(/uk ireland/i, 'UK-Ireland -'),
      path: FILE_PATHS[key]
    }));

    res.json({ files });
  } catch (error) {
    next(error);
  }
});

// Get a specific file
router.get('/:fileId', verifyAuth, async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const filePath = FILE_PATHS[fileId];

    if (!filePath) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    res.json({
      fileId,
      data,
      path: filePath
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
    const filePath = FILE_PATHS[fileId];

    if (!filePath) {
      return res.status(404).json({ error: 'File not found' });
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
