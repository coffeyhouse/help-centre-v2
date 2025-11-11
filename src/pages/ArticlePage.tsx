/**
 * ArticlePage - Individual article view page
 *
 * Features:
 * - Displays a single article fetched from the API
 * - Shows article title, summary, and content fields
 * - Renders HTML content from article fields
 * - Handles internal article links [[link text >|article_id]]
 * - Breadcrumb navigation
 * - Loading and error states
 * - Back button navigation
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import type { ArticleResponse } from '../types';
import { fetchArticle } from '../utils/articleAPI';
import { processArticleContent } from '../utils/articleContentProcessor';
import Breadcrumb from '../components/layout/Breadcrumb';
import {
  ChevronLeftIcon,
  EyeIcon,
  CalendarIcon,
  HashtagIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function ArticlePage() {
  const { region, id } = useParams<{ region: string; id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set page title
  usePageTitle(article?.title || 'Article');

  useEffect(() => {
    async function fetchArticleData() {
      if (!id) {
        setError('No article ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const articleData = await fetchArticle(id, region || 'gb');
        setArticle(articleData);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticleData();
  }, [id, region]);

  const handleBack = () => {
    navigate(-1);
  };

  /**
   * Formats a timestamp to a readable date string
   */
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>

          {!isLoading && !error && article && (
            <>

            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Home', path: `/${region}` },
            { label: article?.title || 'Article', current: true },
          ]}
        />

        {/* Content */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-gray-500">Loading article...</div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <ExclamationCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to load article
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go back
              </button>
            </div>
          ) : article ? (
            <div className="bg-white rounded-lg shadow-sm">              
              {/* Article Metadata */}
              <div className="border-b border-gray-200 px-6 py-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 mt-4">
                  {article.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {article.viewCount > 0 && (
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {article.viewCount.toLocaleString()} views
                    </div>
                  )}
                  {article.lastModifiedDate && (
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Last updated: {formatDate(article.lastModifiedDate)}
                    </div>
                  )}
                  <div className="flex items-center">
                    <HashtagIcon className="w-4 h-4 mr-1" />
                    ID: {article.id}
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="px-6 py-8">                
                {article.summary && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {article.summary}
                    </p>
                  </>
                )}

                {article.fields.map((field, index) => {
                  // Only show fields with content
                  if (!field.content || field.content.trim() === '') {
                    return null;
                  }

                  return (
                    <div key={index} className="mb-8 last:mb-0">
                      {field.name && (
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          {field.name}
                        </h2>
                      )}
                      <div>{processArticleContent(field.content, { region: region || 'gb' })}</div>
                    </div>
                  );
                })}
              </div>

              {/* Article Footer - Helpful section */}
              {(article.solvedCount > 0 || article.unsolvedCount > 0) && (
                <div className="border-t border-gray-200 px-6 py-6">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2 font-medium">Was this article helpful?</p>
                    <div className="flex gap-4">
                      <span>
                        👍 {article.solvedCount} found this helpful
                      </span>
                      <span>
                        👎 {article.unsolvedCount} did not find this helpful
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
