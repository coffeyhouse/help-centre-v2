/**
 * SearchBar - Search input component
 *
 * Features:
 * - Simple search input with submit button
 * - Navigates to search results page on submit
 * - Passes knowledgebase collection for product-specific filtering
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
  const navigate = useNavigate();
  const { region } = useParams<{ region: string }>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      const params = new URLSearchParams();
      params.set('term', query);
      if (knowledgebaseCollection) {
        params.set('collection', knowledgebaseCollection);
      }
      navigate(`/${region}/search?${params.toString()}`);
    }
  };

  return (
    <div className="relative">
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

      {/* Tip text */}
      <p className="text-xs text-gray-400 mt-2">
        Use detailed phrases or exact error messages to find the most relevant help guides
      </p>
    </div>
  );
}
