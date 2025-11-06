# Search API Integration Guide

This guide explains how to integrate your external search API with the help centre application.

## Overview

The search integration uses a **secure server-side proxy pattern** to protect your API credentials:

```
Client (Browser)  →  Express Server  →  Your Search API
                     (with auth)
```

- **Client**: Calls `/api/search` on your Express server
- **Server**: Authenticates with your external search API using environment variables
- **Search API**: Returns results to the server, which forwards them to the client

This ensures your API keys never get exposed to the client.

## Architecture

### Files Modified

1. **Server-side**:
   - `/server/routes/search.js` - New search API proxy route
   - `/server/index.js` - Registers the search route

2. **Client-side**:
   - `/src/utils/mockSearchAPI.ts` - Updated to call server API
   - `/src/types/index.ts` - Search types (SearchParams, SearchResponse)

3. **Configuration**:
   - `.env.example` - Documents required environment variables

## Setup Instructions

### Step 1: Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Then edit `.env` and add your search API credentials:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
ADMIN_PASSWORD=your_admin_password

# Search API Configuration
SEARCH_API_URL=https://your-search-api.com/search
SEARCH_API_KEY=your_api_key_here
SEARCH_API_TOKEN=your_bearer_token_here

# Client Configuration
VITE_API_URL=http://localhost:3001
VITE_USE_MOCK_SEARCH=false
```

### Step 2: Customize the Server Route for Your API

Open `/server/routes/search.js` and adjust it for your specific API:

#### Request Format

The route sends this payload to your search API:

```javascript
{
  query: string,        // Search query
  country: string,      // Country code (gb, ie, us, ca)
  products?: string[],  // Optional: Product IDs to filter
  taxonomy?: string,    // Optional: Taxonomy category
  attributes?: object,  // Optional: Key-value filters
  language?: string,    // Optional: Language code
  limit?: number,       // Optional: Max results (default: 50)
  offset?: number       // Optional: Pagination offset (default: 0)
}
```

**Customize the request body** to match your API's expected format:

```javascript
// Example: If your API expects different field names
const searchRequest = {
  q: query,              // Your API uses 'q' instead of 'query'
  locale: country,       // Your API uses 'locale' instead of 'country'
  product_ids: products, // Your API uses snake_case
  // ... etc
};
```

#### Authentication Headers

The route supports two authentication methods (configure which one you need):

```javascript
headers: {
  'Content-Type': 'application/json',

  // Option 1: API Key authentication
  ...(SEARCH_API_KEY && { 'X-API-Key': SEARCH_API_KEY }),

  // Option 2: Bearer token authentication
  ...(SEARCH_API_TOKEN && { 'Authorization': `Bearer ${SEARCH_API_TOKEN}` }),
}
```

**Customize the headers** to match your API's authentication:

```javascript
headers: {
  'Content-Type': 'application/json',
  'API-Key': SEARCH_API_KEY,           // Your API's specific header name
  'X-Custom-Auth': SEARCH_API_TOKEN,   // Or a custom header
  'X-Client-ID': 'help-centre-app',    // Additional headers if needed
}
```

#### Response Transformation

The route transforms your API's response into the `SearchResponse` format:

```javascript
const searchResponse = {
  results: data.results || data.items || data.hits || [],
  total: data.total || data.totalHits || data.count || 0,
  hasMore: data.hasMore !== undefined
    ? data.hasMore
    : (offset + limit < (data.total || 0)),
  query,
  filters: { country, products, taxonomy, attributes, language },
  executionTime: Date.now() - startTime
};
```

**Customize the mapping** based on your API's response structure:

```javascript
// Example: Your API returns different field names
const searchResponse = {
  results: data.data.articles,           // Your results are nested in data.articles
  total: data.meta.total_count,          // Your total is in meta.total_count
  hasMore: data.meta.has_next_page,      // Your API provides has_next_page
  query,
  filters: { country, products, taxonomy, attributes, language },
  executionTime: Date.now() - startTime
};
```

#### Result Transformation

Each search result is transformed to match the `SearchResult` interface:

```javascript
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
```

**Customize the result mapping** to match your API's result structure.

### Step 3: Test the Integration

#### Test the Server Route

Start the server:

```bash
npm run server
```

Test the health check endpoint:

```bash
curl http://localhost:3001/api/search/health
```

Test the search endpoint:

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "installation",
    "country": "gb",
    "products": ["product-a"],
    "limit": 10
  }'
```

#### Test from the Client

Start both the server and client:

```bash
# Terminal 1: Start the server
npm run server

# Terminal 2: Start the client
npm run dev
```

Then search in the application and check the browser console and server logs.

### Step 4: Development with Mock Data

During development, you can use mock data instead of calling the real API:

```bash
# In your .env file
VITE_USE_MOCK_SEARCH=true
```

This will use the existing mock search results from `/public/data/regions/{region}/search-results.json`.

### Step 5: Error Handling

The client automatically falls back to mock data if the API call fails. Check the console for errors:

- **"Search API error"** - The server API call failed
- **"Falling back to mock search data"** - Using mock data as fallback

## API Contract

### Request: `POST /api/search`

```typescript
interface SearchParams {
  query: string;                          // Required
  country: string;                        // Required
  products?: string[];                    // Optional
  taxonomy?: string;                      // Optional
  attributes?: Record<string, string>;    // Optional
  language?: string;                      // Optional
  limit?: number;                         // Optional (default: 50)
  offset?: number;                        // Optional (default: 0)
}
```

### Response: `SearchResponse`

```typescript
interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  query: string;
  filters: {
    country: string;
    products?: string[];
    taxonomy?: string;
    attributes?: Record<string, string>;
    language?: string;
  };
  executionTime: number;
}
```

### SearchResult

```typescript
interface SearchResult {
  id: string;
  title: string;
  summary: string;
  productId?: string;
  topicId?: string;
  url: string;
  taxonomy?: string[];
  attributes?: Record<string, string>;
  language?: string;
  relevanceScore?: number;
}
```

## Example API Integrations

### Example 1: Algolia

If your search API is Algolia:

```javascript
// In /server/routes/search.js
import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);
const index = client.initIndex('help_articles');

router.post('/', async (req, res) => {
  const { query, country, products, limit = 50, offset = 0 } = req.body;

  const filters = [];
  if (country) filters.push(`country:${country}`);
  if (products?.length) filters.push(`productId:${products.join(' OR productId:')}`);

  const { hits, nbHits } = await index.search(query, {
    filters: filters.join(' AND '),
    hitsPerPage: limit,
    page: Math.floor(offset / limit)
  });

  res.json({
    results: hits.map(hit => ({
      id: hit.objectID,
      title: hit.title,
      summary: hit.summary,
      productId: hit.productId,
      url: hit.url,
      relevanceScore: hit._rankingInfo?.score
    })),
    total: nbHits,
    hasMore: (offset + limit) < nbHits,
    query,
    filters: { country, products },
    executionTime: Date.now() - startTime
  });
});
```

### Example 2: Elasticsearch

If your search API is Elasticsearch:

```javascript
// In /server/routes/search.js
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.SEARCH_API_URL,
  auth: {
    apiKey: process.env.SEARCH_API_KEY
  }
});

router.post('/', async (req, res) => {
  const { query, country, products, limit = 50, offset = 0 } = req.body;

  const must = [
    { multi_match: { query, fields: ['title^2', 'summary'] } }
  ];

  const filter = [];
  if (country) filter.push({ term: { country } });
  if (products?.length) filter.push({ terms: { productId: products } });

  const { hits } = await client.search({
    index: 'help-articles',
    body: {
      query: { bool: { must, filter } },
      from: offset,
      size: limit
    }
  });

  res.json({
    results: hits.hits.map(hit => ({
      id: hit._id,
      title: hit._source.title,
      summary: hit._source.summary,
      productId: hit._source.productId,
      url: hit._source.url,
      relevanceScore: hit._score
    })),
    total: hits.total.value,
    hasMore: (offset + limit) < hits.total.value,
    query,
    filters: { country, products },
    executionTime: Date.now() - startTime
  });
});
```

### Example 3: Custom REST API

If you have a custom REST API:

```javascript
// In /server/routes/search.js
router.post('/', async (req, res) => {
  const { query, country, products, taxonomy, attributes, language, limit, offset } = req.body;

  // Build query parameters for your API
  const params = new URLSearchParams({
    q: query,
    locale: country,
    limit: limit.toString(),
    offset: offset.toString()
  });

  if (products?.length) params.append('products', products.join(','));
  if (taxonomy) params.append('category', taxonomy);
  if (language) params.append('lang', language);

  // Add custom attributes as query params
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      params.append(key, value);
    });
  }

  const response = await fetch(`${process.env.SEARCH_API_URL}?${params}`, {
    headers: {
      'Authorization': `Bearer ${process.env.SEARCH_API_TOKEN}`,
      'Accept': 'application/json'
    }
  });

  const data = await response.json();

  // Transform to our format
  res.json({
    results: data.results.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.description,
      productId: item.product_id,
      url: item.url,
      taxonomy: item.tags,
      relevanceScore: item.score
    })),
    total: data.total,
    hasMore: data.has_more,
    query,
    filters: { country, products, taxonomy, attributes, language },
    executionTime: Date.now() - startTime
  });
});
```

## Deployment

### Environment Variables in Production

Make sure to set these environment variables in your production environment:

- **Heroku**: `heroku config:set SEARCH_API_URL=...`
- **Vercel**: Add in project settings → Environment Variables
- **AWS/Docker**: Set in your deployment configuration

### Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore` by default
2. **Rotate API keys regularly** - Update environment variables when rotating
3. **Use HTTPS in production** - Ensure `SEARCH_API_URL` uses HTTPS
4. **Rate limiting** - Consider adding rate limiting to the `/api/search` endpoint
5. **CORS configuration** - Restrict CORS to your domain in production

## Monitoring and Debugging

### Enable Detailed Logging

Add console logs to track search requests:

```javascript
// In /server/routes/search.js
router.post('/', async (req, res) => {
  console.log('[Search] Request:', { query: req.body.query, country: req.body.country });

  // ... your code

  console.log('[Search] Response:', { total: searchResponse.total, time: searchResponse.executionTime });
});
```

### Check Server Logs

Monitor your server logs for errors:

```bash
# Development
npm run server

# Production (if using PM2)
pm2 logs help-centre-server
```

### Client-side Debugging

Open browser DevTools → Console to see:
- Search API errors
- Fallback to mock data warnings
- Response times

## Troubleshooting

### Issue: "Search service not configured"

**Cause**: `SEARCH_API_URL` not set in environment variables

**Solution**: Add `SEARCH_API_URL` to your `.env` file

### Issue: "Search API request failed"

**Cause**: Authentication failure or API error

**Solution**:
1. Check API credentials in `.env`
2. Verify API URL is correct
3. Check server logs for detailed error messages

### Issue: Mock data is being used instead of real API

**Cause**: `VITE_USE_MOCK_SEARCH=true` or API errors

**Solution**:
1. Set `VITE_USE_MOCK_SEARCH=false` in `.env`
2. Restart Vite dev server (`npm run dev`)
3. Check console for API errors

### Issue: CORS errors in browser

**Cause**: Server and client on different origins without CORS configuration

**Solution**: The server already has CORS enabled. If issues persist, check your API's CORS settings.

## Next Steps

1. ✅ Configure your environment variables
2. ✅ Customize `/server/routes/search.js` for your API
3. ✅ Test the integration
4. 📝 Monitor performance and errors
5. 🚀 Deploy to production

For detailed usage examples, see `SEARCH_API_USAGE.md`.
