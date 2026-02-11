'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/frontend/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { simulateSlowLoad, getProductImage, formatPrice, checkStock } from '@/frontend/utils/productHelpers';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(product.price);

  useEffect(() => {
    const loadProduct = async () => {
      await simulateSlowLoad(product.id);
      setIsLoading(false);
    };

    loadProduct();

    const priceInterval = setInterval(() => {
      const newPrice = parseFloat(formatPrice(product.price, product.id).replace('$', ''));
      setDisplayPrice(newPrice);
    }, 5000);

    return () => {
      clearInterval(priceInterval);
    };
  }, [product.id, product.price]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    try {
      await addToCart(product);
      setTimeout(() => {
        setIsAdding(false);
      }, 300);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setIsAdding(false);
    }
  };

  const handleImageLoad = () => {
    setTimeout(() => {
      setImageLoaded(true);
    }, 100);
  };

  const productImage = getProductImage(product);
  const inStock = checkStock(product);

  if (isLoading) {
    return (
      <div className="bg-surface-100 rounded-lg border border-sentry-border overflow-hidden h-96 animate-pulse">
        <div className="h-48 bg-surface-50"></div>
        <div className="p-4">
          <div className="h-4 bg-surface-50 rounded mb-2"></div>
          <div className="h-3 bg-surface-50 rounded mb-4"></div>
          <div className="h-8 bg-surface-50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-surface-100 rounded-lg border border-sentry-border overflow-hidden hover:border-primary-500 transition-colors duration-300 cursor-pointer">
        <div className="relative h-48 w-full">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-surface-50 animate-pulse"></div>
          )}
          <Image
            src={productImage}
            alt={product.name}
            fill
            className="object-cover"
            onLoad={handleImageLoad}
          />
          {product.featured && (
            <div className="absolute top-2 right-2 bg-accent-pink text-white px-2 py-1 rounded text-xs font-bold">
              Featured
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-sentry-text mb-2">{product.name}</h3>
          <p className="text-sm text-sentry-muted mb-2 line-clamp-2">{product.description}</p>
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1 mb-2">
              {product.colors.slice(0, 3).map((color, idx) => (
                <span key={idx} className="text-xs bg-surface-50 text-sentry-muted px-2 py-1 rounded">
                  {color}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-bold text-primary-400">
              ${displayPrice.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !inStock}
              className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-400 disabled:bg-surface-50 disabled:text-sentry-muted disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isAdding ? 'Adding...' : 'Add'}</span>
            </button>
          </div>
          {!inStock && (
            <p className="text-accent-pink text-sm mt-2">Out of stock</p>
          )}
        </div>
      </div>
    </Link>
  );
}
