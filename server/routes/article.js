/**
 * Article API Routes
 *
 * This route acts as a proxy to your external article/solution API,
 * securely handling authentication without exposing credentials to the client.
 */

import express from 'express';

const router = express.Router();

/**
 * GET /api/article/health
 *
 * Health check endpoint to verify article API connectivity
 * NOTE: This route must come BEFORE the /:id route to avoid conflicts
 */
router.get('/health', async (req, res) => {
  const SEARCH_API_URL = process.env.SEARCH_API_URL;

  if (!SEARCH_API_URL) {
    return res.status(503).json({
      status: 'unavailable',
      message: 'Article API not configured'
    });
  }

  try {
    const baseUrl = SEARCH_API_URL.replace(/\/search\/?$/, '');
    res.json({
      status: 'ok',
      message: 'Article API configured',
      apiUrl: baseUrl.replace(/\/[^/]+$/, '/***') // Hide sensitive parts
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/article/:id
 *
 * Fetches a single article by ID using the external article API
 *
 * Path parameters:
 * - id: string (required) - Article ID (must be 15 numeric characters)
 *
 * Query parameters:
 * - country: string (optional) - Country code (gb, ie, us, ca) - defaults to 'gb'
 *
 * Response (ArticleResponse):
 * {
 *   author: string
 *   approver: string
 *   attributeSetName: string | null
 *   attributes: Array
 *   categoryCode: string
 *   collections: string[]
 *   createDate: number
 *   diagnosticResponses: Array
 *   fields: Array<{name: string, content: string}>
 *   id: string
 *   language: string
 *   lastModifiedDate: number
 *   minorModifiedDate: number
 *   keywords: string
 *   question: string | null
 *   renewDate: number
 *   solutionBoost: number
 *   status: string
 *   type: string
 *   taxonomy: string[]
 *   templateName: string
 *   title: string
 *   translations: Array
 *   viewCount: number
 *   solvedCount: number
 *   unsolvedCount: number
 *   summary: string
 *   revisionID: string | null
 *   templateSolutionID: string
 * }
 */
router.get('/:id', async (req, res) => {
  const startTime = Date.now();

  try {
    const { id } = req.params;
    const { country = 'gb' } = req.query;

    // Validate article ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid required parameter: id'
      });
    }

    // Validate article ID format (15 numeric characters)
    if (!/^\d{15}$/.test(id)) {
      return res.status(400).json({
        error: 'Invalid article ID format. Must be 15 numeric characters.'
      });
    }

    // Get API credentials from environment variables
    const SEARCH_API_URL = process.env.SEARCH_API_URL;
    const SEARCH_API_AUTH_TOKEN = process.env.SEARCH_API_AUTH_TOKEN;
    const SEARCH_API_COMPANY_CODE = process.env.SEARCH_API_COMPANY_CODE;

    if (!SEARCH_API_URL) {
      console.error('SEARCH_API_URL environment variable not configured');
      return res.status(500).json({
        error: 'Article service not configured'
      });
    }

    if (!SEARCH_API_AUTH_TOKEN) {
      console.error('SEARCH_API_AUTH_TOKEN environment variable not configured');
      return res.status(500).json({
        error: 'Article service authentication not configured'
      });
    }

    // Map country code to imp_group
    const impGroupMap = {
      'gb': 'UK - Guest',
      'ie': 'Ireland - Guest',
      'us': 'United States - Guest',
      'ca': 'Canada - Guest'
    };
    const impGroup = impGroupMap[country.toLowerCase()] || 'UK - Guest';

    // Build the API base URL (replace /search with /solution/:id)
    // Example: https://website.com/portal/api/rest/search -> https://website.com/portal/api/rest/solution/:id
    const baseUrl = SEARCH_API_URL.replace(/\/search\/?$/, '');
    const articleApiUrl = `${baseUrl}/solution/${id}`;

    // Build query parameters
    const params = new URLSearchParams({
      companyCode: SEARCH_API_COMPANY_CODE || 'company_name',
      appInterface: 'ss',
      imp_group: impGroup,
      doArchivedCheck: 'false',
      loggingEnabled: 'false',
      isDiagnosticResponse: 'false'
    });

    // Build full URL
    const fullUrl = `${articleApiUrl}?${params.toString()}`;

    // Call the article API
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${SEARCH_API_AUTH_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Article API error:', response.status, errorText);

      // Handle specific error cases
      if (response.status === 404) {
        return res.status(404).json({
          error: 'Article not found',
          details: `Article with ID ${id} does not exist`
        });
      }

      return res.status(response.status).json({
        error: 'Article API request failed',
        details: errorText
      });
    }

    // Parse the response from your external API
    const article = await response.json();

    // Add metadata about the request
    const articleResponse = {
      ...article,
      _metadata: {
        fetchedAt: new Date().toISOString(),
        executionTime: Date.now() - startTime,
        country
      }
    };

    res.json(articleResponse);

  } catch (error) {
    console.error('Article fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
