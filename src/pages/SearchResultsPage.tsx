/**
 * SearchResultsPage - Search results page
 *
 * Features:
 * - Displays search results based on URL search params
 * - Shows results with title and summary
 * - Pagination (10 results per page)
 * - Links to external knowledgebase articles
 * - Breadcrumb navigation
 * - Handles empty states
 */

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import type { SearchResult } from '../types';
import { search } from '../utils/mockSearchAPI';
import Breadcrumb from '../components/layout/Breadcrumb';

const RESULTS_PER_PAGE = 10;

export default function SearchResultsPage() {
  const { region } = useParams<{ region: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchTerm = searchParams.get('term') || '';
  const knowledgebaseCollection = searchParams.get('collection') || undefined;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Set page title
  usePageTitle(searchTerm ? `Search: ${searchTerm}` : 'Search Results');

  // Calculate pagination
  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
  const offset = (currentPage - 1) * RESULTS_PER_PAGE;

  useEffect(() => {
    async function fetchResults() {
      if (!searchTerm) {
        setResults([]);
        setTotalResults(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResponse = await search({
          query: searchTerm,
          country: region || 'gb',
          products: knowledgebaseCollection ? [knowledgebaseCollection] : undefined,
          limit: RESULTS_PER_PAGE,
          offset
        });
        setResults(searchResponse.results);
        setTotalResults(searchResponse.total);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [searchTerm, region, knowledgebaseCollection, offset]);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Generate external KB URL based on region
  const getKnowledgeBaseUrl = (solutionId: string): string => {
    const regionPrefix = region || 'gb';
    return `https://${regionPrefix}-kb.sagedatacloud.com/portal/app/portlets/results/viewsolution.jsp?solutionid=${solutionId}`;
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
                  Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchTerm}"
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
            <>
              <div className="space-y-4">
                {results.map((result) => (
                  <a
                    key={result.id}
                    href={getKnowledgeBaseUrl(result.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      {result.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {result.summary}
                    </p>
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                      <span>View article</span>
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum: number;

                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-4 py-2 rounded-md border transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
