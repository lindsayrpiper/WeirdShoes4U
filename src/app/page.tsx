import Link from 'next/link';
import SearchBar from '@/frontend/components/SearchBar';
import ProductList from '@/frontend/components/ProductList';
import { Product } from '@/types';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`http://localhost:3000/api/products?featured=true`, {
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
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Welcome to EcomStore</h1>
            <p className="text-xl mb-8">
              Discover amazing products at unbeatable prices
            </p>
            <div className="mb-8">
              <SearchBar />
            </div>
            <Link
              href="/products"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          {featuredProducts.length > 0 ? (
            <ProductList products={featuredProducts} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading featured products...</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/products?category=Electronics"
              className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">Electronics</h3>
              <p className="text-gray-600">Latest tech gadgets</p>
            </Link>
            <Link
              href="/products?category=Accessories"
              className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">Accessories</h3>
              <p className="text-gray-600">Essential add-ons</p>
            </Link>
            <Link
              href="/products"
              className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">All Products</h3>
              <p className="text-gray-600">Browse everything</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
