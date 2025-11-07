import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyAuth } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Path to regions.json (still used for country-to-group mapping)
const REGIONS_PATH = path.join(__dirname, '..', '..', 'public', 'data', 'regions.json');
const GROUPS_DIR = path.join(__dirname, '..', '..', 'public', 'data', 'groups');

/**
 * Helper function to get admin groups from the groups folder
 */
async function getAdminRegions() {
  try {
    // Read all group folders
    const groupFolders = await fs.readdir(GROUPS_DIR, { withFileTypes: true });
    const groups = [];

    for (const folder of groupFolders) {
      if (!folder.isDirectory()) continue;

      const groupId = folder.name;
      const configPath = path.join(GROUPS_DIR, groupId, 'config.json');

      try {
        const configData = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configData);

        // Extract country information from the config
        const countryNames = config.countries.map(c => c.name);
        const countryCodes = config.countries.map(c => c.code);

        // Get currency, dateFormat, and language from first country
        const firstCountry = config.countries[0] || {};

        groups.push({
          id: config.id || groupId,
          name: config.name,
          code: config.id || groupId,
          countries: countryNames,
          countryCodes: countryCodes,
          currency: firstCountry.currency || 'USD',
          dateFormat: firstCountry.dateFormat || 'YYYY-MM-DD',
          language: firstCountry.language || 'en-US',
        });
      } catch (error) {
        console.error(`Error reading group config for ${groupId}:`, error);
        // Skip this group if config can't be read
      }
    }

    return groups;
  } catch (error) {
    console.error('Error reading groups:', error);
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
 * Helper function to create default files for a new group
 */
async function createRegionFiles(groupId, groupName, countries) {
  const groupDir = path.join(GROUPS_DIR, groupId);
  const countriesDir = path.join(__dirname, '..', '..', 'public', 'data', 'countries');

  // Create group directory if it doesn't exist
  try {
    await fs.mkdir(groupDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  // Create group config.json
  const groupConfig = {
    id: groupId,
    name: groupName,
    productIds: [],
    countries: countries.map((country, index) => ({
      code: typeof country === 'string' ? `${groupId}-${index + 1}` : country.code,
      name: typeof country === 'string' ? country : country.name,
      language: 'en-US', // Default, can be customized
      currency: 'USD', // Default, can be customized
      currencySymbol: '$',
      dateFormat: 'YYYY-MM-DD',
      default: index === 0,
    })),
    quickAccessCards: [],
  };

  const configPath = path.join(groupDir, 'config.json');
  try {
    await fs.access(configPath);
    console.log(`Group config already exists, skipping`);
  } catch {
    await fs.writeFile(configPath, JSON.stringify(groupConfig, null, 2));
    console.log(`Created config.json for group ${groupId}`);
  }

  // Default file templates for group-level files
  const files = {
    'incidents.json': { banners: [] },
    'popups.json': { popups: [] },
    'contact.json': { contactMethods: [] },
  };

  // Create each group-level file
  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(groupDir, filename);
    try {
      // Check if file already exists
      await fs.access(filePath);
      console.log(`File ${filename} already exists, skipping`);
    } catch {
      // File doesn't exist, create it
      await fs.writeFile(filePath, JSON.stringify(content, null, 2));
      console.log(`Created ${filename} for group ${groupId}`);
    }
  }

  // Create products directory
  const productsDir = path.join(groupDir, 'products');
  try {
    await fs.mkdir(productsDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  // Create country config files for each country
  for (const country of countries) {
    const countryCode = typeof country === 'string' ? country : country.code;
    const countryName = typeof country === 'string' ? country : country.name;
    const countryDir = path.join(countriesDir, countryCode.toLowerCase());

    try {
      await fs.mkdir(countryDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }

    const configPath = path.join(countryDir, 'config.json');

    // Check if config already exists
    try {
      await fs.access(configPath);
      console.log(`Country config for ${countryCode} already exists, skipping`);
    } catch {
      // Create default country config
      const countryConfig = {
        region: countryCode.toLowerCase(),
        displayName: countryName,
        personas: [
          {
            id: 'customer',
            label: "I'm a Customer",
            default: true
          },
          {
            id: 'accountant',
            label: "I'm an Accountant or Bookkeeper",
            default: false
          }
        ],
        navigation: {
          main: [
            {
              label: 'Help Centre',
              path: `/${countryCode.toLowerCase()}`,
              icon: 'home'
            },
            {
              label: 'Products',
              path: `/${countryCode.toLowerCase()}/products`,
              type: 'dropdown'
            },
            {
              label: 'Contact us',
              path: `/${countryCode.toLowerCase()}/contact`
            }
          ]
        }
      };

      await fs.writeFile(configPath, JSON.stringify(countryConfig, null, 2));
      console.log(`Created config for country ${countryCode}`);
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
 * Create a new admin group
 * Body: { name, code, countries: [], currency, dateFormat, language }
 */
router.post('/', verifyAuth, async (req, res) => {
  try {
    const { name, code, countries, currency, dateFormat, language } = req.body;

    // Validation
    if (!name || !code || !countries) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Array.isArray(countries) || countries.length === 0) {
      return res.status(400).json({ error: 'Countries must be a non-empty array' });
    }

    // Check if group already exists
    const groupDir = path.join(GROUPS_DIR, code);
    try {
      await fs.access(groupDir);
      return res.status(400).json({ error: 'Group code already exists' });
    } catch {
      // Group doesn't exist, continue
    }

    // Create group files and country configs
    await createRegionFiles(code, name, countries);

    // Update regions.json to add mapping (for backward compatibility)
    try {
      const regionsData = await fs.readFile(REGIONS_PATH, 'utf-8');
      const existingCountries = JSON.parse(regionsData);

      const newCountries = countries.map((country, index) => ({
        code: typeof country === 'string' ? `${code}-${index + 1}` : country.code,
        name: typeof country === 'string' ? country : country.name,
        language: language || 'en-US',
        currency: currency || 'USD',
        currencySymbol: getCurrencySymbol(currency || 'USD'),
        dateFormat: dateFormat || 'YYYY-MM-DD',
        region: code, // Map to group ID
        regionName: name,
        default: index === 0,
      }));

      const updatedCountries = [...existingCountries, ...newCountries];

      // Create backup
      const backupPath = `${REGIONS_PATH}.backup-${Date.now()}`;
      await fs.writeFile(backupPath, regionsData);

      // Write updated regions
      await fs.writeFile(REGIONS_PATH, JSON.stringify(updatedCountries, null, 2));
    } catch (error) {
      console.warn('Warning: Could not update regions.json:', error);
    }

    res.json({
      success: true,
      message: 'Group created successfully',
      region: {
        id: code,
        name,
        code,
        countries,
        currency: currency || 'USD',
        dateFormat: dateFormat || 'YYYY-MM-DD',
        language: language || 'en-US',
      },
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
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
