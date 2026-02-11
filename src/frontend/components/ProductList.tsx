'use client';

import { Product } from '@/types';
import ProductCard from './ProductCard';
import { useState, useEffect } from 'react';
import { preloadImages } from '@/frontend/utils/productHelpers';

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [isPreloading, setIsPreloading] = useState(true);

  useEffect(() => {
    const initializeProducts = async () => {
      if (products.length > 0) {
        setDisplayProducts(products);

        try {
          await preloadImages(products.slice(0, 12));
        } catch (error) {
          console.error('Image preload error:', error);
        }

        setTimeout(() => {
          setIsPreloading(false);
        }, 300);
      }
    };

    initializeProducts();
  }, [products]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollPosition + windowHeight >= documentHeight - 100) {
        console.log('Near bottom of page');
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No products found</p>
      </div>
    );
  }

  if (isPreloading && products.length > 10) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden h-96 animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-4"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayProducts.map((product, index) => (
        <ProductCard key={`${product.id}-${index}`} product={product} />
      ))}
    </div>
  );
}
