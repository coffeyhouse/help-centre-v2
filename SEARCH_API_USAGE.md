# Mock Search API Usage Guide

This document explains how to use the enhanced mock search API in the help centre application.

## Overview

The mock search API simulates a full-featured search service with support for:
- Query-based search (title and summary matching)
- Multiple product filtering
- Taxonomy filtering
- Attribute-based filtering
- Language filtering
- Relevance scoring
- Pagination
- Performance metrics

## TypeScript Types

### SearchParams

```typescript
interface SearchParams {
  query: string;                          // Required: Search query string
  country: string;                        // Required: Country code (gb, ie, us, ca)
  products?: string[];                    // Optional: Array of product IDs
  taxonomy?: string;                      // Optional: Taxonomy category
  attributes?: Record<string, string>;    // Optional: Key-value attribute filters
  language?: string;                      // Optional: Language code (en, fr, etc.)
  limit?: number;                         // Optional: Max results (default: 50)
  offset?: number;                        // Optional: Pagination offset (default: 0)
}
```

### SearchResponse

```typescript
interface SearchResponse {
  results: SearchResult[];                // Array of matching results
  total: number;                          // Total number of matches
  hasMore: boolean;                       // Whether more results exist
  query: string;                          // Original query
  filters: {                              // Applied filters
    country: string;
    products?: string[];
    taxonomy?: string;
    attributes?: Record<string, string>;
    language?: string;
  };
  executionTime: number;                  // Execution time in milliseconds
}
```

### SearchResult

```typescript
interface SearchResult {
  id: string;                             // Unique identifier
  title: string;                          // Article title
  summary: string;                        // Article summary
  productId?: string;                     // Associated product ID
  topicId?: string;                       // Associated topic ID
  url: string;                            // Article URL
  taxonomy?: string[];                    // Taxonomy categories
  attributes?: Record<string, string>;    // Additional attributes
  language?: string;                      // Content language
  relevanceScore?: number;                // Calculated relevance score
}
```

## Basic Usage

### Simple Search

```typescript
import { search } from '@/utils/mockSearchAPI';

const response = await search({
  query: 'installation',
  country: 'gb'
});

console.log(`Found ${response.total} results in ${response.executionTime}ms`);
response.results.forEach(result => {
  console.log(`${result.title} (score: ${result.relevanceScore})`);
});
```

### Search with Product Filter

```typescript
const response = await search({
  query: 'vat',
  country: 'gb',
  products: ['product-a', 'product-b']
});
```

### Search with Multiple Filters

```typescript
const response = await search({
  query: 'payroll',
  country: 'ie',
  products: ['product-c'],
  taxonomy: 'getting-started',
  attributes: {
    difficulty: 'beginner',
    version: '2024'
  },
  language: 'en'
});
```

### Pagination

```typescript
// First page
const page1 = await search({
  query: 'invoice',
  country: 'gb',
  limit: 10,
  offset: 0
});

// Second page
if (page1.hasMore) {
  const page2 = await search({
    query: 'invoice',
    country: 'gb',
    limit: 10,
    offset: 10
  });
}
```

## React Component Example

### Using in a Search Component

```tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { search } from '@/utils/mockSearchAPI';
import type { SearchResponse } from '@/types';

export const SearchPage: React.FC = () => {
  const { region } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await search({
        query: searchQuery,
        country: region || 'gb',
        limit: 20
      });
      setResults(response);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch} disabled={loading}>
        Search
      </button>

      {results && (
        <div>
          <p>Found {results.total} results in {results.executionTime.toFixed(2)}ms</p>
          {results.results.map(result => (
            <div key={result.id}>
              <h3>{result.title}</h3>
              <p>{result.summary}</p>
              <small>Relevance: {result.relevanceScore}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Advanced Search with Filters

```tsx
import React, { useState } from 'react';
import { search } from '@/utils/mockSearchAPI';
import type { SearchParams } from '@/types';

export const AdvancedSearch: React.FC = () => {
  const [params, setParams] = useState<SearchParams>({
    query: '',
    country: 'gb',
    products: [],
    limit: 20,
    offset: 0
  });

  const handleSearch = async () => {
    const response = await search(params);
    // Handle results...
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search query"
        value={params.query}
        onChange={e => setParams({ ...params, query: e.target.value })}
      />

      <select
        multiple
        value={params.products || []}
        onChange={e => setParams({
          ...params,
          products: Array.from(e.target.selectedOptions, opt => opt.value)
        })}
      >
        <option value="product-a">Product A</option>
        <option value="product-b">Product B</option>
        <option value="product-c">Product C</option>
      </select>

      <input
        type="text"
        placeholder="Taxonomy"
        value={params.taxonomy || ''}
        onChange={e => setParams({ ...params, taxonomy: e.target.value })}
      />

      <button onClick={handleSearch}>Search</button>
    </div>
  );
};
```

## Backward Compatibility

The legacy `searchArticles()` function is still available for backward compatibility:

```typescript
import { searchArticles } from '@/utils/mockSearchAPI';

// Old way (still works)
const results = await searchArticles('installation', 'gb', 'product-a', 10);

// Returns: SearchResult[]
```

However, it's recommended to migrate to the new `search()` function:

```typescript
import { search } from '@/utils/mockSearchAPI';

// New way
const response = await search({
  query: 'installation',
  country: 'gb',
  products: ['product-a'],
  limit: 10
});

// Returns: SearchResponse with additional metadata
const results = response.results;
```

## Relevance Scoring

The mock API calculates relevance scores based on:

1. **Exact title match**: +100 points
2. **Title starts with query**: +50 points
3. **Title contains query**: +30 points
4. **Summary contains query**: +10 points
5. **Short title bonus**: +5 points (titles < 50 chars)

Results are automatically sorted by relevance score (highest first).

## Filtering Logic

### Multiple Products
When `products` array is provided, only results matching ANY of the specified products are returned (OR logic).

### Taxonomy
When `taxonomy` is provided, only results with that taxonomy in their `taxonomy` array are returned.

### Attributes
When `attributes` are provided, ALL attribute filters must match (AND logic):

```typescript
// Only returns results where difficulty='beginner' AND version='2024'
await search({
  query: 'tutorial',
  country: 'gb',
  attributes: {
    difficulty: 'beginner',
    version: '2024'
  }
});
```

### Language
When `language` is provided, only results matching that exact language code are returned.

## Performance

- **Simulated API delay**: 200ms
- **Caching**: Search results are cached per region
- **Execution time**: Tracked and returned in `SearchResponse.executionTime`

## Migration from Real API

When you're ready to integrate a real search API, simply replace the implementation in `/src/utils/mockSearchAPI.ts` while keeping the same interface:

```typescript
// Replace mock implementation
export async function search(params: SearchParams): Promise<SearchResponse> {
  // Call your real API here
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  return await response.json();
}
```

All consuming components will continue to work without changes!

## Examples by Use Case

### Search within a specific product

```typescript
const response = await search({
  query: 'backup',
  country: 'gb',
  products: ['product-a']
});
```

### Search across multiple products

```typescript
const response = await search({
  query: 'reports',
  country: 'ie',
  products: ['product-a', 'product-b', 'product-c']
});
```

### Search by taxonomy category

```typescript
const response = await search({
  query: 'setup',
  country: 'us',
  taxonomy: 'getting-started'
});
```

### Search with attributes

```typescript
const response = await search({
  query: 'advanced features',
  country: 'ca',
  attributes: {
    userLevel: 'advanced',
    platform: 'desktop'
  }
});
```

### Language-specific search

```typescript
const response = await search({
  query: 'facture',
  country: 'ca',
  language: 'fr'
});
```

### Combined filters

```typescript
const response = await search({
  query: 'tax calculation',
  country: 'gb',
  products: ['product-a'],
  taxonomy: 'tax-management',
  attributes: {
    region: 'uk',
    year: '2024'
  },
  language: 'en',
  limit: 10
});
```

## Data Structure for Mock Results

To add mock search results with the new fields, update your `/public/data/regions/{region}/search-results.json`:

```json
{
  "searchResults": [
    {
      "id": "search-001",
      "title": "Installing Product A Desktop Software",
      "summary": "Step-by-step guide to downloading and installing...",
      "productId": "product-a",
      "topicId": "install-software",
      "url": "/products/product-a/topics/install-software",
      "taxonomy": ["getting-started", "installation"],
      "attributes": {
        "difficulty": "beginner",
        "platform": "desktop",
        "version": "2024"
      },
      "language": "en"
    }
  ]
}
```

The new fields are all optional, so existing mock data will continue to work.
