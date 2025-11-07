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
          label: 'Home',
          path: '/:country',
          icon: 'home'
        },
        {
          label: 'Contact us',
          path: '/:country/contact'
        }
      ]
    },
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
}

/**
 * GET /api/regions/public
 * Public endpoint - List all countries from all groups (no auth required)
 * Returns a flattened list of countries for the region selector
 */
router.get('/public', async (req, res) => {
  try {
    // Read all group folders
    const groupFolders = await fs.readdir(GROUPS_DIR, { withFileTypes: true });
    const countries = [];

    for (const folder of groupFolders) {
      if (!folder.isDirectory()) continue;

      const groupId = folder.name;
      const configPath = path.join(GROUPS_DIR, groupId, 'config.json');

      try {
        const configData = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configData);

        // Add each country from this group to the flattened list
        for (const country of config.countries || []) {
          countries.push({
            code: country.code,
            name: country.name,
            language: country.language || 'en-US',
            currency: country.currency || 'USD',
            currencySymbol: country.currencySymbol || '$',
            dateFormat: country.dateFormat || 'YYYY-MM-DD',
            region: groupId, // Group identifier (e.g., 'uki')
            regionName: config.name, // Group display name (e.g., 'United Kingdom & Ireland')
            default: country.default || false,
          });
        }
      } catch (error) {
        console.error(`Error reading group config for ${groupId}:`, error);
      }
    }

    res.json(countries);
  } catch (error) {
    console.error('Error fetching public regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

/**
 * GET /api/regions/public/:countryCode/config
 * Public endpoint - Get configuration for a specific country (no auth required)
 * Returns personas, navigation, and other UI config from the group config
 */
router.get('/public/:countryCode/config', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const normalizedCode = countryCode.toLowerCase();

    // Find which group contains this country
    const groupFolders = await fs.readdir(GROUPS_DIR, { withFileTypes: true });

    for (const folder of groupFolders) {
      if (!folder.isDirectory()) continue;

      const groupId = folder.name;
      const configPath = path.join(GROUPS_DIR, groupId, 'config.json');

      try {
        const configData = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configData);

        // Check if this group contains the requested country
        const country = (config.countries || []).find(
          (c) => c.code.toLowerCase() === normalizedCode
        );

        if (country) {
          // Return config with country-specific data
          const navigation = config.navigation || { main: [] };

          // Replace :country placeholder in navigation paths
          const processedNavigation = {
            main: navigation.main.map((item) => ({
              ...item,
              path: item.path.replace(':country', normalizedCode),
            })),
          };

          return res.json({
            region: normalizedCode,
            displayName: country.name,
            personas: config.personas || [],
            navigation: processedNavigation,
          });
        }
      } catch (error) {
        console.error(`Error reading group config for ${groupId}:`, error);
      }
    }

    // Country not found in any group
    res.status(404).json({ error: `Country ${countryCode} not found` });
  } catch (error) {
    console.error('Error fetching country config:', error);
    res.status(500).json({ error: 'Failed to fetch country config' });
  }
});

/**
 * GET /api/regions
 * List all admin regions (requires auth)
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

    // Create group files
    await createRegionFiles(code, name, countries);

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
 * DELETE /api/regions/:regionId
 * Delete an admin region (future implementation)
 */
router.delete('/:regionId', verifyAuth, async (req, res) => {
  // TODO: Implement region deletion
  res.status(501).json({ error: 'Region deletion not yet implemented' });
});

export default router;
