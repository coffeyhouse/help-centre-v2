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
    const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
    const SEARCH_API_TOKEN = process.env.SEARCH_API_TOKEN;

    if (!SEARCH_API_URL) {
      console.error('SEARCH_API_URL environment variable not configured');
      return res.status(500).json({
        error: 'Search service not configured'
      });
    }

    // Prepare the request to your external search API
    // Adjust the structure based on your actual API requirements
    const searchRequest = {
      query,
      country,
      products,
      taxonomy,
      attributes,
      language,
      limit,
      offset
    };

    // Call your external search API
    const response = await fetch(SEARCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers as required by your API
        ...(SEARCH_API_KEY && { 'X-API-Key': SEARCH_API_KEY }),
        ...(SEARCH_API_TOKEN && { 'Authorization': `Bearer ${SEARCH_API_TOKEN}` }),
      },
      body: JSON.stringify(searchRequest)
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

    // Transform the response to match SearchResponse interface
    // Adjust this based on your actual API response structure
    const searchResponse = {
      results: data.results || data.items || data.hits || [],
      total: data.total || data.totalHits || data.count || 0,
      hasMore: data.hasMore !== undefined
        ? data.hasMore
        : (offset + limit < (data.total || 0)),
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

    // Ensure results match SearchResult interface
    // Transform if necessary based on your API's response structure
    searchResponse.results = searchResponse.results.map(result => ({
      id: result.id || result._id || result.articleId,
      title: result.title || result.name,
      summary: result.summary || result.description || result.excerpt || '',
      productId: result.productId || result.product,
      topicId: result.topicId || result.topic || result.categoryId,
      url: result.url || result.link || result.path,
      taxonomy: result.taxonomy || result.categories || result.tags,
      attributes: result.attributes || result.metadata || {},
      language: result.language || result.lang,
      relevanceScore: result.relevanceScore || result.score || result._score
    }));

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
