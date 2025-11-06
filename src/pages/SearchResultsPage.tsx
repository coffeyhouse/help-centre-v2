/**
 * SearchResultsPage - Search results page
 *
 * Features:
 * - Displays search results based on URL search params
 * - Shows results with title and summary
 * - Breadcrumb navigation
 * - Links to article pages
 * - Handles empty states
 */

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import type { SearchResult } from '../types';
import { searchArticles } from '../utils/mockSearchAPI';
import Breadcrumb from '../components/layout/Breadcrumb';

export default function SearchResultsPage() {
  const { region } = useParams<{ region: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchTerm = searchParams.get('term') || '';
  const productId = searchParams.get('product') || undefined;

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Set page title
  usePageTitle(searchTerm ? `Search: ${searchTerm}` : 'Search Results');

  useEffect(() => {
    async function fetchResults() {
      if (!searchTerm) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchArticles(
          searchTerm,
          region || 'gb',
          productId
        );
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [searchTerm, region, productId]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-black text-white py-8">
        <div className="container-custom">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Search Results
          </h1>

          {searchTerm && (
            <p className="text-lg text-gray-300">
              {isLoading ? (
                'Searching...'
              ) : (
                <>
                  Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchTerm}"
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Home', path: `/${region}` },
            { label: 'Search Results', current: true },
          ]}
        />

        {/* Results */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-gray-500">Loading results...</div>
            </div>
          ) : !searchTerm ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No search term provided
              </h2>
              <p className="text-gray-600 mb-6">
                Please enter a search term to find help articles.
              </p>
              <button
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go back
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No results found
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn't find any articles matching "{searchTerm}". Try different keywords or check your spelling.
              </p>
              <button
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go back
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={result.id}
                  to={`/${region}${result.url}`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                    {result.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {result.summary}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    <span>Read more</span>
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
