'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductList from '@/frontend/components/ProductList';
import SearchBar from '@/frontend/components/SearchBar';
import { Product } from '@/types';

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryQuery = searchParams.get('category');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryQuery, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
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

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
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
            onClick={() => setSelectedCategory('')}
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
              onClick={() => setSelectedCategory(category)}
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
