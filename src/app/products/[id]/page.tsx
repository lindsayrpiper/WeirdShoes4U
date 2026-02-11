'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/frontend/context/CartContext';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { simulateSlowLoad, getRelatedProducts } from '@/frontend/utils/productHelpers';
import {
  trackApiCall,
  measureAsync,
  trackInteraction,
  addPerformanceMark,
  measureBetweenMarks,
  trackPageLoad,
  setUserContext,
} from '@/frontend/utils/sentryPerformance';
import * as Sentry from '@sentry/nextjs';

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
    // Track page load
    trackPageLoad(`Product Detail - ${params.id}`);

    // Add performance mark
    addPerformanceMark('product-detail-init');

    // Log page view
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Product detail page loaded: ${params.id}`,
      level: 'info',
      data: {
        product_id: params.id,
      },
    });

    // Set tags for this product view
    Sentry.setTags({
      page_type: 'product_detail',
      product_id: params.id as string,
    });

    fetchProduct();
  }, [params.id]);

  useEffect(() => {
    if (product) {
      // Set product context for error tracking
      Sentry.setContext('product', {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        productId: product.productId,
      });

      // Auto-select first size and color
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);

        Sentry.addBreadcrumb({
          category: 'ui.selection',
          message: `Auto-selected size: ${product.sizes[0]}`,
          level: 'info',
        });
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);

        Sentry.addBreadcrumb({
          category: 'ui.selection',
          message: `Auto-selected color: ${product.colors[0]}`,
          level: 'info',
        });
      }

      // Track product view metrics
      Sentry.setMeasurement('product_price', product.price, 'usd');
      Sentry.setMeasurement('product_stock', product.stock, 'none');
      Sentry.setMeasurement('product_sizes_available', product.sizes?.length || 0, 'none');
      Sentry.setMeasurement('product_colors_available', product.colors?.length || 0, 'none');
    }
  }, [product]);

  const fetchProduct = async () => {
    return await measureAsync(
      'fetch_product_detail',
      async () => {
        try {
          setLoading(true);
          addPerformanceMark('product-fetch-start');

          // Create a span for the entire product fetch operation
          await Sentry.startSpan(
            {
              name: 'Fetch Product Details',
              op: 'http.client',
              attributes: {
                'product.id': params.id as string,
              },
            },
            async (span) => {
              // Track slow load simulation
              await measureAsync(
                'product_slow_load_simulation',
                async () => {
                  await simulateSlowLoad(params.id as string);
                },
                'function'
              );

              // Fetch main product
              const data = await trackApiCall(`/api/products/${params.id}`, async () => {
                const response = await fetch(`/api/products/${params.id}`);
                return await response.json();
              });

              if (data.success) {
                setProduct(data.data);

                span?.setAttribute('product.name', data.data.name);
                span?.setAttribute('product.category', data.data.category);
                span?.setAttribute('product.price', data.data.price);

                // Log successful product fetch
                Sentry.addBreadcrumb({
                  category: 'api',
                  message: `Product fetched: ${data.data.name}`,
                  level: 'info',
                  data: {
                    product_id: data.data.id,
                    product_name: data.data.name,
                    category: data.data.category,
                    price: data.data.price,
                    stock: data.data.stock,
                  },
                });

                // Log if product is low stock
                if (data.data.stock < 10 && data.data.stock > 0) {
                  Sentry.captureMessage('Low stock product viewed', {
                    level: 'info',
                    tags: {
                      product_id: data.data.id,
                      stock_level: data.data.stock,
                    },
                  });
                }

                // Log if product is out of stock
                if (data.data.stock === 0) {
                  Sentry.captureMessage('Out of stock product viewed', {
                    level: 'warning',
                    tags: {
                      product_id: data.data.id,
                      product_name: data.data.name,
                    },
                  });
                }

                // Fetch related products
                await Sentry.startSpan(
                  {
                    name: 'Fetch Related Products',
                    op: 'http.client',
                  },
                  async (relatedSpan) => {
                    const allProductsData = await trackApiCall('/api/products', async () => {
                      const response = await fetch('/api/products');
                      return await response.json();
                    });

                    if (allProductsData.success) {
                      const related = getRelatedProducts(data.data, allProductsData.data);
                      setRelatedProducts(related);

                      relatedSpan?.setAttribute('related_products_count', related.length);

                      Sentry.addBreadcrumb({
                        category: 'api',
                        message: `Found ${related.length} related products`,
                        level: 'info',
                      });

                      Sentry.setMeasurement('related_products_count', related.length, 'none');
                    }
                  }
                );
              } else {
                // Product not found
                Sentry.captureMessage('Product not found', {
                  level: 'warning',
                  tags: {
                    product_id: params.id as string,
                  },
                });

                router.push('/products');
              }
            }
          );

          addPerformanceMark('product-fetch-end');
          measureBetweenMarks('product-fetch-duration', 'product-fetch-start', 'product-fetch-end');
        } catch (error) {
          console.error('Failed to fetch product:', error);

          Sentry.captureException(error, {
            tags: {
              operation: 'fetch_product_detail',
              product_id: params.id as string,
            },
            contexts: {
              product: {
                id: params.id,
                url: window.location.href,
              },
            },
            level: 'error',
          });

          router.push('/products');
        } finally {
          setLoading(false);
        }
      },
      'function'
    );
  };

  const handleImageError = (context: string, imageUrl: string, productData?: { id: string; name: string }) => {
    Sentry.captureException(new Error(`Image failed to load: ${context}`), {
      level: 'warning',
      tags: {
        error_type: 'image_load_error',
        product_id: productData?.id || params.id,
        page: 'product_detail',
        context,
      },
      contexts: {
        image: {
          url: imageUrl,
          context,
          product_id: productData?.id,
          product_name: productData?.name,
        },
      },
    });

    Sentry.addBreadcrumb({
      category: 'ui.error',
      message: `Image load failed: ${context}`,
      level: 'error',
      data: {
        image_url: imageUrl,
        context,
      },
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Track add to cart interaction
    trackInteraction('add_to_cart_detail_page', 'product', {
      product_id: product.id,
      product_name: product.name,
      quantity,
      selected_size: selectedSize,
      selected_color: selectedColor,
      price: product.price,
      total_price: product.price * quantity,
    });

    setIsAdding(true);

    try {
      await measureAsync(
        'add_to_cart_from_detail',
        async () => {
          await addToCart(product, quantity);

          // Log successful add to cart
          Sentry.addBreadcrumb({
            category: 'user_action',
            message: `Added ${quantity}x ${product.name} to cart`,
            level: 'info',
            data: {
              product_id: product.id,
              quantity,
              size: selectedSize,
              color: selectedColor,
              price: product.price,
            },
          });

          // Track metrics
          Sentry.setMeasurement('cart_add_quantity', quantity, 'none');
          Sentry.setMeasurement('cart_add_value', product.price * quantity, 'usd');
        },
        'ui.action'
      );

      setTimeout(() => {
        alert('Added to cart successfully!');
        setIsAdding(false);
      }, 200);
    } catch (error) {
      alert('Failed to add to cart');

      Sentry.captureException(error, {
        tags: {
          action: 'add_to_cart',
          product_id: product.id,
          page: 'product_detail',
        },
        contexts: {
          cart_action: {
            product_id: product.id,
            product_name: product.name,
            quantity,
            selected_size: selectedSize,
            selected_color: selectedColor,
          },
        },
        level: 'error',
      });

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
        onClick={() => {
          trackInteraction('navigate_back', 'product', {
            from_product_id: product?.id,
            from_product_name: product?.name,
          });

          Sentry.addBreadcrumb({
            category: 'navigation',
            message: 'User clicked back button',
            level: 'info',
          });

          router.back();
        }}
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
            onError={() => handleImageError('main_product_image', product.image, { id: product.id, name: product.name })}
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
                    onClick={() => {
                      trackInteraction('select_size', 'product', {
                        product_id: product.id,
                        size,
                        previous_size: selectedSize,
                      });
                      setSelectedSize(size);

                      Sentry.addBreadcrumb({
                        category: 'ui.selection',
                        message: `Size selected: ${size}`,
                        level: 'info',
                        data: { product_id: product.id, size },
                      });
                    }}
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
                    onClick={() => {
                      trackInteraction('select_color', 'product', {
                        product_id: product.id,
                        color,
                        previous_color: selectedColor,
                      });
                      setSelectedColor(color);

                      Sentry.addBreadcrumb({
                        category: 'ui.selection',
                        message: `Color selected: ${color}`,
                        level: 'info',
                        data: { product_id: product.id, color },
                      });
                    }}
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
                onClick={() => {
                  const newQuantity = Math.max(1, quantity - 1);
                  trackInteraction('decrease_quantity', 'product', {
                    product_id: product.id,
                    old_quantity: quantity,
                    new_quantity: newQuantity,
                  });
                  setQuantity(newQuantity);

                  Sentry.addBreadcrumb({
                    category: 'ui.quantity',
                    message: `Quantity decreased: ${quantity} → ${newQuantity}`,
                    level: 'info',
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-xl font-medium w-12 text-center">{quantity}</span>
              <button
                onClick={() => {
                  const newQuantity = Math.min(product.stock, quantity + 1);
                  if (newQuantity > quantity) {
                    trackInteraction('increase_quantity', 'product', {
                      product_id: product.id,
                      old_quantity: quantity,
                      new_quantity: newQuantity,
                    });
                    setQuantity(newQuantity);

                    Sentry.addBreadcrumb({
                      category: 'ui.quantity',
                      message: `Quantity increased: ${quantity} → ${newQuantity}`,
                      level: 'info',
                    });
                  } else {
                    // User tried to exceed stock
                    Sentry.captureMessage('User attempted to exceed available stock', {
                      level: 'info',
                      tags: {
                        product_id: product.id,
                        available_stock: product.stock,
                        attempted_quantity: quantity + 1,
                      },
                    });
                  }
                }}
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
                onClick={() => {
                  trackInteraction('click_related_product', 'product', {
                    from_product_id: product?.id,
                    from_product_name: product?.name,
                    to_product_id: relatedProduct.id,
                    to_product_name: relatedProduct.name,
                    to_product_category: relatedProduct.category,
                  });

                  Sentry.addBreadcrumb({
                    category: 'navigation',
                    message: `Clicked related product: ${relatedProduct.name}`,
                    level: 'info',
                    data: {
                      from_product: product?.id,
                      to_product: relatedProduct.id,
                    },
                  });

                  router.push(`/products/${relatedProduct.id}`);
                }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={relatedProduct.thumbnail || relatedProduct.image}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover"
                    onError={() => handleImageError('related_product_image', relatedProduct.thumbnail || relatedProduct.image, { id: relatedProduct.id, name: relatedProduct.name })}
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
