/**
 * SearchBar - Search input with type-ahead functionality
 *
 * Features:
 * - Type-ahead search results dropdown
 * - Debounced search API calls
 * - "View more results" link to full search page
 * - Keyboard navigation support
 * - Click outside to close dropdown
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { SearchResult } from '../../types';
import { search } from '../../utils/mockSearchAPI';

interface SearchBarProps {
  placeholder?: string;
  productId?: string;
  knowledgebaseCollection?: string;
}

export default function SearchBar({
  placeholder = 'Search for answers...',
  productId,
  knowledgebaseCollection,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { region } = useParams<{ region: string }>();

  // Debounced search
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const searchResponse = await search({
          query,
          country: region || 'gb',
          products: knowledgebaseCollection ? [knowledgebaseCollection] : undefined,
          limit: 5 // Limit to 5 results for dropdown
        });
        setResults(searchResponse.results);
        setIsOpen(searchResponse.results.length > 0);
        setIsLoading(false);
      } catch (error) {
        console.error('Search error:', error);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, region, knowledgebaseCollection]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      navigateToSearchPage();
    }
  };

  const navigateToSearchPage = () => {
    const params = new URLSearchParams();
    params.set('term', query);
    if (productId) {
      params.set('product', productId);
    }
    navigate(`/${region}/search?${params.toString()}`);
    setIsOpen(false);
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(`/${region}${result.url}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-700 p-4 rounded-md bg-gray-900 text-white px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          type="submit"
          className="absolute right-2 top-[24px] -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Search"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {/* Type-ahead dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          ) : (
            <>
              {/* Search results */}
              <div className="max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900 mb-1">
                      {result.title}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {result.summary}
                    </div>
                  </button>
                ))}
              </div>

              {/* View more results link */}
              <button
                onClick={navigateToSearchPage}
                className="w-full p-3 bg-gray-50 text-blue-600 hover:bg-gray-100 font-medium text-sm transition-colors border-t border-gray-200"
              >
                View all results for "{query}"
              </button>
            </>
          )}
        </div>
      )}

      {/* Tip text */}
      <p className="text-xs text-gray-400 mt-2">
        Use detailed phrases or exact error messages to find the most relevant help guides
      </p>
    </div>
  );
}
