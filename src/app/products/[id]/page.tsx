'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/frontend/context/CartContext';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { simulateSlowLoad, formatPrice, getRelatedProducts } from '@/frontend/utils/productHelpers';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      await simulateSlowLoad(params.id as string);

      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);

        const allProductsResponse = await fetch('/api/products');
        const allProductsData = await allProductsResponse.json();

        if (allProductsData.success) {
          const related = getRelatedProducts(data.data, allProductsData.data);
          setRelatedProducts(related);
        }
      } else {
        router.push('/products');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAdding(true);

    try {
      await addToCart(product, quantity);

      setTimeout(() => {
        alert('Added to cart successfully!');
        setIsAdding(false);
      }, 200);
    } catch (error) {
      alert('Failed to add to cart');
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative h-96 md:h-[600px] rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-primary-600 mb-6">
            ${product.price.toFixed(2)}
          </p>

          <div className="mb-6">
            <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {product.category}
            </span>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

          {product.productId && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">Product ID: {product.productId}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </p>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Size
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedSize === size
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Color
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedColor === color
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-xl font-medium w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className="w-full md:w-auto bg-primary-600 text-white px-8 py-4 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg font-semibold transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                onClick={() => router.push(`/products/${relatedProduct.id}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={relatedProduct.thumbnail || relatedProduct.image}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{relatedProduct.name}</h3>
                  <p className="text-xl font-bold text-primary-600">
                    ${relatedProduct.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
