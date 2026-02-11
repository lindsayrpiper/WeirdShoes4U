'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductList from '@/frontend/components/ProductList';
import SearchBar from '@/frontend/components/SearchBar';
import { Product } from '@/types';
import {
  trackApiCall,
  measureAsync,
  trackInteraction,
  addPerformanceMark,
  measureBetweenMarks,
  trackPageLoad,
} from '@/frontend/utils/sentryPerformance';
import * as Sentry from '@sentry/nextjs';

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryQuery = searchParams.get('category');

  useEffect(() => {
    // Track page load performance
    trackPageLoad('Products Catalog');

    // Add performance mark for page initialization
    addPerformanceMark('catalog-page-init');

    // Log page view
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: 'Products catalog page loaded',
      level: 'info',
    });

    fetchCategories();
  }, []);

  useEffect(() => {
    // Track filter/search changes
    if (searchQuery || categoryQuery || selectedCategory) {
      Sentry.addBreadcrumb({
        category: 'ui.filter',
        message: 'Catalog filters changed',
        data: {
          search: searchQuery,
          category: categoryQuery || selectedCategory,
        },
        level: 'info',
      });
    }

    fetchProducts();
  }, [searchQuery, categoryQuery, selectedCategory]);

  const fetchCategories = async () => {
    return await measureAsync(
      'fetch_categories',
      async () => {
        try {
          addPerformanceMark('categories-fetch-start');

          const data = await trackApiCall('/api/products/categories', async () => {
            const response = await fetch('/api/products/categories');
            return await response.json();
          });

          if (data.success) {
            setCategories(data.data);

            // Log successful category fetch
            Sentry.addBreadcrumb({
              category: 'api',
              message: `Fetched ${data.data.length} categories`,
              level: 'info',
              data: {
                categories: data.data,
              },
            });

            // Track metric
            Sentry.setMeasurement('categories_loaded', data.data.length, 'none');
          }

          addPerformanceMark('categories-fetch-end');
          measureBetweenMarks('categories-fetch-duration', 'categories-fetch-start', 'categories-fetch-end');
        } catch (error) {
          console.error('Failed to fetch categories:', error);

          Sentry.captureException(error, {
            tags: {
              operation: 'fetch_categories',
              page: 'catalog',
            },
            level: 'error',
          });
        }
      },
      'http.client'
    );
  };

  const fetchProducts = async () => {
    return await measureAsync(
      'fetch_products_catalog',
      async () => {
        try {
          setLoading(true);
          addPerformanceMark('products-fetch-start');

          let url = '/api/products';
          const params = new URLSearchParams();

          if (searchQuery) {
            params.append('search', searchQuery);
          } else if (categoryQuery) {
            params.append('category', categoryQuery);
          } else if (selectedCategory) {
            params.append('category', selectedCategory);
          }

          if (params.toString()) {
            url += `?${params.toString()}`;
          }

          // Create span for product fetching
          await Sentry.startSpan(
            {
              name: 'Fetch Products Catalog',
              op: 'http.client',
              attributes: {
                'http.url': url,
                'catalog.search': searchQuery || '',
                'catalog.category': categoryQuery || selectedCategory || 'all',
              },
            },
            async (span) => {
              const data = await trackApiCall(url, async () => {
                const response = await fetch(url);
                return await response.json();
              });

              if (data.success) {
                setProducts(data.data);

                // Log successful product fetch
                Sentry.addBreadcrumb({
                  category: 'api',
                  message: `Fetched ${data.data.length} products from catalog`,
                  level: 'info',
                  data: {
                    count: data.data.length,
                    search: searchQuery,
                    category: categoryQuery || selectedCategory,
                    url,
                  },
                });

                // Track metrics
                Sentry.setMeasurement('catalog_products_loaded', data.data.length, 'none');

                // Log if no products found
                if (data.data.length === 0) {
                  Sentry.captureMessage('No products found in catalog', {
                    level: 'warning',
                    tags: {
                      search: searchQuery || '',
                      category: categoryQuery || selectedCategory || '',
                    },
                  });
                }

                // Log if too many results (potential performance issue)
                if (data.data.length > 50) {
                  Sentry.addBreadcrumb({
                    category: 'performance',
                    message: `Large result set: ${data.data.length} products`,
                    level: 'warning',
                  });
                }

                span?.setAttribute('catalog.products_count', data.data.length);
              }
            }
          );

          addPerformanceMark('products-fetch-end');
          measureBetweenMarks('products-fetch-duration', 'products-fetch-start', 'products-fetch-end');
        } catch (error) {
          console.error('Failed to fetch products:', error);

          Sentry.captureException(error, {
            tags: {
              operation: 'fetch_products',
              page: 'catalog',
              search: searchQuery || '',
              category: categoryQuery || selectedCategory || '',
            },
            contexts: {
              catalog: {
                search: searchQuery,
                category: categoryQuery || selectedCategory,
                url: window.location.href,
              },
            },
            level: 'error',
          });
        } finally {
          setLoading(false);
        }
      },
      'function'
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6 text-center">Products</h1>
        <SearchBar />
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => {
              trackInteraction('filter_category_all', 'catalog', {
                category: 'all',
                previous_category: selectedCategory || 'none',
              });
              setSelectedCategory('');
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedCategory === ''
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                trackInteraction('filter_category', 'catalog', {
                  category,
                  previous_category: selectedCategory || 'none',
                });
                setSelectedCategory(category);
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {(searchQuery || categoryQuery || selectedCategory) && (
        <div className="mb-6">
          <p className="text-gray-600">
            {searchQuery && `Search results for "${searchQuery}"`}
            {categoryQuery && `Category: ${categoryQuery}`}
            {selectedCategory && !categoryQuery && `Category: ${selectedCategory}`}
            {` - ${products.length} products found`}
          </p>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><p className="text-center">Loading...</p></div>}>
      <ProductsContent />
    </Suspense>
  );
}
