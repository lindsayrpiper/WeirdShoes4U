import Link from 'next/link';
import SearchBar from '@/frontend/components/SearchBar';
import ProductList from '@/frontend/components/ProductList';
import { Product } from '@/types';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products?featured=true`, {
      cache: 'no-store',
    });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-surface-400 via-primary-900 to-surface-200 text-sentry-text py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Weird<span className="text-accent-pink">Shoes</span><span className="text-primary-500">4U</span>
            </h1>
            <p className="text-xl mb-8 text-sentry-muted">
              Funky shoes for developers who debug in style
            </p>
            <div className="mb-8">
              <SearchBar />
            </div>
            <Link
              href="/products"
              className="inline-block bg-primary-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-primary-400 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-sentry-text">Featured Products</h2>
          {featuredProducts.length > 0 ? (
            <ProductList products={featuredProducts} />
          ) : (
            <div className="text-center py-12">
              <p className="text-sentry-muted">Loading featured products...</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-surface-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-sentry-text">Shop by Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/products?category=Running Shoes"
              className="bg-surface-100 border border-sentry-border rounded-lg p-8 text-center hover:border-primary-500 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2 text-sentry-text">Running Shoes</h3>
              <p className="text-sentry-muted">Debug on the run</p>
            </Link>
            <Link
              href="/products?category=Heels"
              className="bg-surface-100 border border-sentry-border rounded-lg p-8 text-center hover:border-primary-500 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2 text-sentry-text">Heels</h3>
              <p className="text-sentry-muted">Error elegance</p>
            </Link>
            <Link
              href="/products?category=Boots"
              className="bg-surface-100 border border-sentry-border rounded-lg p-8 text-center hover:border-primary-500 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2 text-sentry-text">Chunky Boots</h3>
              <p className="text-sentry-muted">Stomp bugs</p>
            </Link>
            <Link
              href="/products?category=Slippers"
              className="bg-surface-100 border border-sentry-border rounded-lg p-8 text-center hover:border-primary-500 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2 text-sentry-text">Slippers</h3>
              <p className="text-sentry-muted">Cozy coding</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
