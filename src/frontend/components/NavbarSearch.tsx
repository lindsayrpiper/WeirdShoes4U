'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useDebounce } from '@/frontend/hooks/useDebounce';
import { useClickOutside } from '@/frontend/hooks/useClickOutside';
import { useEscapeKey } from '@/frontend/hooks/useEscapeKey';
import { SearchResultItem } from './SearchResultItem';

const RESULT_LIMIT = 5;

export const NavbarSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 300);

  // Close dropdown when clicking outside
  useClickOutside(searchRef, () => setIsOpen(false));

  // Close dropdown when pressing Escape
  useEscapeKey(() => {
    setIsOpen(false);
    inputRef.current?.blur();
  });

  // Fetch search results
  React.useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const data = await response.json();
        const limitedResults = data.products.slice(0, RESULT_LIMIT);
        setResults(limitedResults);
        setIsOpen(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setError(null);
    inputRef.current?.focus();
  };

  const handleResultSelect = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const handleViewAll = () => {
    router.push(`/products?search=${encodeURIComponent(query)}`);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search products"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={isOpen}
          />

          {/* Loading spinner or Clear button */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
            ) : query && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 animate-slideDown"
          role="listbox"
        >
          {error ? (
            <div className="px-4 py-8 text-center text-red-600">
              <p>{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <p>No products found</p>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto">
                {results.map((product) => (
                  <SearchResultItem
                    key={product.id}
                    product={product}
                    onSelect={handleResultSelect}
                  />
                ))}
              </div>

              {/* View All Results button */}
              <div className="border-t border-gray-200">
                <button
                  onClick={handleViewAll}
                  className="w-full px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors text-center"
                >
                  View all results for &quot;{query}&quot;
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
