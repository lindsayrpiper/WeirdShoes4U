import { Product } from '@/backend/models';
import { mockProducts } from '@/backend/lib/mockData';

class ProductService {
  private products: Product[] = mockProducts;

  getAllProducts(): Product[] {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  getFeaturedProducts(): Product[] {
    return this.products.filter(product => product.featured);
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(
      product => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  searchProducts(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return this.products.filter(
      product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
  }

  getCategories(): string[] {
    const categories = new Set(this.products.map(p => p.category));
    return Array.from(categories);
  }

  updateProductStock(productId: string, quantity: number): boolean {
    const product = this.products.find(p => p.id === productId);
    if (!product) return false;

    if (product.stock < quantity) return false;

    product.stock -= quantity;
    return true;
  }
}

export const productService = new ProductService();
