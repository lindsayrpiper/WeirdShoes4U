import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/backend/services/productService';
import { trackApiRoute, trackServiceOperation, addBreadcrumb } from '@/backend/utils/sentryPerformance';
import * as Sentry from '@sentry/nextjs';

const simulateApiDelay = async () => {
  const randomDelay = Math.floor(Math.random() * 800) + 200;
  await new Promise(resolve => setTimeout(resolve, randomDelay));
};

export async function GET(request: NextRequest) {
  return await trackApiRoute('/api/products', async () => {
    try {
      // Track the artificial delay
      await Sentry.startSpan(
        { name: 'Simulated API Delay', op: 'function' },
        simulateApiDelay
      );

      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      const search = searchParams.get('search');
      const featured = searchParams.get('featured');

      // Add request context
      addBreadcrumb('api', `Fetching products: category=${category}, search=${search}, featured=${featured}`);

      let products;

      // Track different product fetching operations
      if (search) {
        // Track search query metric
        addBreadcrumb('api', `Product search request: query="${search}", length_bucket=${search.length <= 3 ? 'short' : search.length <= 10 ? 'medium' : 'long'}`);
        Sentry.logger.info('api.products.search.request', {
          query: search,
          query_length_bucket: search.length <= 3 ? 'short' : search.length <= 10 ? 'medium' : 'long',
        });

        products = await trackServiceOperation('productService', 'searchProducts', async () => {
          return productService.searchProducts(search);
        });
      } else if (category) {
        products = await trackServiceOperation('productService', 'getProductsByCategory', async () => {
          return productService.getProductsByCategory(category);
        });
      } else if (featured === 'true') {
        products = await trackServiceOperation('productService', 'getFeaturedProducts', async () => {
          return productService.getFeaturedProducts();
        });
      } else {
        products = await trackServiceOperation('productService', 'getAllProducts', async () => {
          return productService.getAllProducts();
        });
      }

      // Intentional performance issue: 5% chance of severe delay
      if (Math.random() < 0.05) {
        await Sentry.startSpan(
          { name: 'Critical Performance Issue', op: 'sleep' },
          async () => {
            Sentry.captureMessage('Severe API delay triggered', 'warning');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        );
      }

      // Track product count
      Sentry.setMeasurement('products_returned', products.length, 'none');

      return NextResponse.json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          api_route: '/api/products',
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch products',
        },
        { status: 500 }
      );
    }
  });
}
