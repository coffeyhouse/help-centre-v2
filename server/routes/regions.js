import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyAuth } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Path to regions.json
const REGIONS_PATH = path.join(__dirname, '..', '..', 'public', 'data', 'regions.json');
const DATA_DIR = path.join(__dirname, '..', '..', 'public', 'data', 'regions');

/**
 * Helper function to group countries by admin region
 */
async function getAdminRegions() {
  try {
    const data = await fs.readFile(REGIONS_PATH, 'utf-8');
    const countries = JSON.parse(data);

    // Group countries by region
    const regionsMap = {};
    countries.forEach((country) => {
      const regionKey = country.region;
      if (!regionsMap[regionKey]) {
        regionsMap[regionKey] = {
          id: regionKey,
          name: formatRegionName(regionKey),
          code: regionKey,
          countries: [],
          currency: country.currency,
          dateFormat: country.dateFormat,
          language: country.language,
        };
      }
      regionsMap[regionKey].countries.push(country.name);
    });

    return Object.values(regionsMap);
  } catch (error) {
    console.error('Error reading regions:', error);
    throw error;
  }
}

/**
 * Helper function to format region name
 * e.g., "uk-ireland" -> "UK & Ireland"
 */
function formatRegionName(regionKey) {
  return regionKey
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' & ');
}

/**
 * Helper function to create default files for a new region
 */
async function createRegionFiles(regionId) {
  const regionDir = path.join(DATA_DIR, regionId);

  // Create region directory if it doesn't exist
  try {
    await fs.mkdir(regionDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  // Default file templates
  const files = {
    'products.json': { products: [], hotTopics: [], quickAccessCards: [] },
    'topics.json': { supportHubs: [] },
    'articles.json': { articles: {} },
    'incidents.json': { banners: [] },
    'popups.json': { popups: [] },
    'contact.json': { contactMethods: [] },
    'release-notes.json': { releaseNotes: [] },
  };

  // Create each file
  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(regionDir, filename);
    try {
      // Check if file already exists
      await fs.access(filePath);
      console.log(`File ${filename} already exists, skipping`);
    } catch {
      // File doesn't exist, create it
      await fs.writeFile(filePath, JSON.stringify(content, null, 2));
      console.log(`Created ${filename} for region ${regionId}`);
    }
  }
}

/**
 * GET /api/regions
 * List all admin regions
 */
router.get('/', verifyAuth, async (req, res) => {
  try {
    const regions = await getAdminRegions();
    res.json({ regions });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

/**
 * POST /api/regions
 * Create a new admin region
 * Body: { name, code, countries: [], currency, dateFormat, language }
 */
router.post('/', verifyAuth, async (req, res) => {
  try {
    const { name, code, countries, currency, dateFormat, language } = req.body;

    // Validation
    if (!name || !code || !countries || !currency || !dateFormat || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Array.isArray(countries) || countries.length === 0) {
      return res.status(400).json({ error: 'Countries must be a non-empty array' });
    }

    // Read existing regions
    const data = await fs.readFile(REGIONS_PATH, 'utf-8');
    const existingCountries = JSON.parse(data);

    // Check if region code already exists
    const regionExists = existingCountries.some((c) => c.region === code);
    if (regionExists) {
      return res.status(400).json({ error: 'Region code already exists' });
    }

    // Create new country entries for each country in the region
    const newCountries = countries.map((countryName, index) => ({
      code: `${code}-${index + 1}`, // Generate unique country code
      name: countryName,
      language,
      currency,
      currencySymbol: getCurrencySymbol(currency),
      dateFormat,
      region: code,
      default: index === 0, // First country is default
    }));

    // Add new countries to the list
    const updatedCountries = [...existingCountries, ...newCountries];

    // Create backup
    const backupPath = `${REGIONS_PATH}.backup-${Date.now()}`;
    await fs.writeFile(backupPath, data);

    // Write updated regions
    await fs.writeFile(REGIONS_PATH, JSON.stringify(updatedCountries, null, 2));

    // Create region files
    await createRegionFiles(code);

    res.json({
      success: true,
      message: 'Region created successfully',
      region: {
        id: code,
        name,
        code,
        countries,
        currency,
        dateFormat,
        language,
      },
    });
  } catch (error) {
    console.error('Error creating region:', error);
    res.status(500).json({ error: 'Failed to create region' });
  }
});

/**
 * Helper function to get currency symbol
 */
function getCurrencySymbol(currency) {
  const symbols = {
    GBP: '£',
    EUR: '€',
    USD: '$',
  };
  return symbols[currency] || currency;
}

/**
 * DELETE /api/regions/:regionId
 * Delete an admin region (future implementation)
 */
router.delete('/:regionId', verifyAuth, async (req, res) => {
  // TODO: Implement region deletion
  res.status(501).json({ error: 'Region deletion not yet implemented' });
});

export default router;
