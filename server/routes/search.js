/**
 * Search API Routes
 *
 * This route acts as a proxy to your external search API,
 * securely handling authentication without exposing credentials to the client.
 */

import express from 'express';

const router = express.Router();

/**
 * POST /api/search
 *
 * Searches articles using the external search API
 *
 * Request body (SearchParams):
 * {
 *   query: string (required)
 *   country: string (required)
 *   products?: string[]
 *   taxonomy?: string
 *   attributes?: Record<string, string>
 *   language?: string
 *   limit?: number
 *   offset?: number
 * }
 *
 * Response (SearchResponse):
 * {
 *   results: SearchResult[]
 *   total: number
 *   hasMore: boolean
 *   query: string
 *   filters: {...}
 *   executionTime: number
 * }
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      query,
      country,
      products,
      taxonomy,
      attributes,
      language,
      limit = 50,
      offset = 0
    } = req.body;

    // Validate required parameters
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid required parameter: query'
      });
    }

    if (!country || typeof country !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid required parameter: country'
      });
    }

    // Get API credentials from environment variables
    const SEARCH_API_URL = process.env.SEARCH_API_URL;
    const SEARCH_API_AUTH_TOKEN = process.env.SEARCH_API_AUTH_TOKEN;
    const SEARCH_API_COMPANY_CODE = process.env.SEARCH_API_COMPANY_CODE;

    if (!SEARCH_API_URL) {
      console.error('SEARCH_API_URL environment variable not configured');
      return res.status(500).json({
        error: 'Search service not configured'
      });
    }

    if (!SEARCH_API_AUTH_TOKEN) {
      console.error('SEARCH_API_AUTH_TOKEN environment variable not configured');
      return res.status(500).json({
        error: 'Search service authentication not configured'
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

    // Calculate page number from offset and limit
    const page = Math.floor(offset / limit) + 1;

    // Build query parameters
    const params = new URLSearchParams({
      companyCode: SEARCH_API_COMPANY_CODE || 'company_name',
      appInterface: 'ss',
      imp_group: impGroup,
      searchType: 'Keyword',
      queryText: query,
      page: page.toString(),
      searchFavoritesOnly: 'false',
      sortBy: 'relevance',
      loggingEnabled: 'true',
      verboseResult: 'false',
      translateFacets: 'false'
    });

    // Add collections (products) - multiple collections separated by semicolon
    if (products && products.length > 0) {
      params.set('collections', products.join(';'));
    }

    // Build full URL
    const fullUrl = `${SEARCH_API_URL}?${params.toString()}`;

    // Call the search API
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${SEARCH_API_AUTH_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search API error:', response.status, errorText);

      return res.status(response.status).json({
        error: 'Search API request failed',
        details: errorText
      });
    }

    // Parse the response from your external API
    const data = await response.json();

    const total = data.totalHits || 0;

    // Transform the response to match SearchResponse interface
    const searchResponse = {
      results: data.solutions || [],
      total,
      hasMore: (offset + limit) < total,
      query,
      filters: {
        country,
        products,
        taxonomy,
        attributes,
        language
      },
      executionTime: Date.now() - startTime
    };

    // Transform each solution to match SearchResult interface
    searchResponse.results = searchResponse.results.map(solution => {
      // Use the first collection as productId (simplified for now)
      const productId = solution.collections && solution.collections.length > 0
        ? solution.collections[0]
        : undefined;

      // Use the numeric id field (e.g., "210322142713950") not templateSolutionID
      const solutionId = solution.id || solution.templateSolutionID;

      // Generate URL based on solution ID
      const url = `/articles/${solutionId}`;

      // Extract taxonomy from categoryCode
      const taxonomy = solution.categoryCode ? [solution.categoryCode] : [];

      return {
        id: solutionId,
        title: solution.title,
        summary: solution.summary,
        productId,
        topicId: solution.categoryCode,
        url,
        taxonomy,
        attributes: {
          solutionType: solution.solutionType,
          categoryCode: solution.categoryCode,
          keywords: solution.keywords,
          collections: solution.collections,
          templateSolutionID: solution.templateSolutionID // Store template ID for reference
        },
        language: language || 'en', // Use requested language or default to 'en'
        relevanceScore: solution.score
      };
    });

    res.json(searchResponse);

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/search/health
 *
 * Health check endpoint to verify search API connectivity
 */
router.get('/health', async (req, res) => {
  const SEARCH_API_URL = process.env.SEARCH_API_URL;

  if (!SEARCH_API_URL) {
    return res.status(503).json({
      status: 'unavailable',
      message: 'Search API not configured'
    });
  }

  try {
    // You can add a health check call to your search API here if it has one
    res.json({
      status: 'ok',
      message: 'Search API configured',
      apiUrl: SEARCH_API_URL.replace(/\/[^/]+$/, '/***') // Hide sensitive parts
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;
