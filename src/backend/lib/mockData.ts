import { Product, User, Order } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 99.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    stock: 50,
    featured: true,
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with fitness tracking',
    price: 199.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    stock: 30,
    featured: true,
  },
  {
    id: '3',
    name: 'Laptop Backpack',
    description: 'Durable laptop backpack with multiple compartments',
    price: 49.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    stock: 100,
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with programmable keys',
    price: 129.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
    stock: 25,
    featured: true,
  },
  {
    id: '5',
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with multiple ports',
    price: 39.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop',
    stock: 75,
  },
  {
    id: '6',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 29.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
    stock: 60,
  },
  {
    id: '7',
    name: 'Phone Case',
    description: 'Protective phone case with shock absorption',
    price: 19.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop',
    stock: 150,
  },
  {
    id: '8',
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 360° sound',
    price: 79.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    stock: 40,
    featured: true,
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    password: '$2b$10$kJKAx/3nBQ0VLSqVO7V/8ukuyw8K/cnHW3ypPwg9ZZHs9l0RjajpG', // password: 'demo123'
    createdAt: new Date(),
  },
];

// In-memory storage (will be replaced with database)
export const ordersStore: Map<string, Order> = new Map();
export const cartsStore: Map<string, any> = new Map();
