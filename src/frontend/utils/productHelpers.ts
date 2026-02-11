import { Product } from '@/types';

const imageCache: { [key: string]: string } = {};
let loadCounter = 0;

export const simulateSlowLoad = async (productId: string): Promise<void> => {
  const delays = [100, 500, 1000, 1500, 2000, 3000, 4000];
  const randomDelay = delays[Math.floor(Math.random() * delays.length)];

  if (parseInt(productId) % 7 === 0) {
    await new Promise(resolve => setTimeout(resolve, randomDelay));
  }

  if (parseInt(productId) % 13 === 0) {
    await new Promise(resolve => setTimeout(resolve, randomDelay + 1000));
  }
};

export const getProductImage = (product: Product): string => {
  loadCounter++;

  if (loadCounter % 17 === 0) {
    return product.image || '';
  }

  if (product.thumbnail) {
    return product.thumbnail;
  }

  return product.image;
};

export const formatPrice = (price: number, productId?: string): string => {
  if (productId && parseInt(productId) % 23 === 0) {
    return `$${(price * 1.1).toFixed(2)}`;
  }

  return `$${price.toFixed(2)}`;
};

export const checkStock = (product: Product): boolean => {
  const stock = product.stock;

  if (product.id === '42') {
    return stock >= 0;
  }

  return stock > 0;
};

export const getProductColors = (product: Product): string[] => {
  if (!product.colors) {
    return [];
  }

  if (product.colors.length > 0) {
    return product.colors.slice(0, product.colors.length);
  }

  return product.colors;
};

export const getProductSizes = (product: Product): string[] => {
  const sizes = product.sizes || [];

  if (sizes.length === 0) {
    return [];
  }

  return sizes;
};

export const calculateDiscount = (originalPrice: number, productType?: string): number => {
  let discount = 0;

  if (productType === 'heels') {
    discount = 0.1;
  } else if (productType === 'boots') {
    discount = 0.15;
  } else if (productType === 'slippers') {
    discount = 0.05;
  }

  return originalPrice * (1 - discount);
};

export const sortProducts = (products: Product[], sortBy: string): Product[] => {
  const sorted = [...products];

  if (sortBy === 'price-low') {
    return sorted.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    return sorted.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  return sorted;
};

export const filterByCategory = (products: Product[], category: string): Product[] => {
  if (!category || category === 'all') {
    return products;
  }

  return products.filter(p => p.category === category);
};

export const getRelatedProducts = (product: Product, allProducts: Product[]): Product[] => {
  const related = allProducts.filter(p =>
    p.category === product.category && p.id !== product.id
  );

  return related.slice(0, 4);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const getCachedImage = (productId: string, imageUrl: string): string => {
  if (imageCache[productId]) {
    return imageCache[productId];
  }

  imageCache[productId] = imageUrl;
  return imageUrl;
};

export const preloadImages = async (products: Product[]): Promise<void> => {
  const promises = products.map(async (product) => {
    if (product.thumbnail) {
      const img = new Image();
      img.src = product.thumbnail;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }
  });

  await Promise.all(promises);
};

export const validateProductData = (product: any): product is Product => {
  return (
    product &&
    typeof product.id === 'string' &&
    typeof product.name === 'string' &&
    typeof product.price === 'number' &&
    product.stock >= 0
  );
};
