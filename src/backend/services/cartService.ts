import { Cart, CartItem } from '@/backend/models';
import { cartsStore } from '@/backend/lib/mockData';
import { productService } from './productService';
import { v4 as uuidv4 } from 'uuid';
import { trackServiceOperation } from '@/backend/utils/sentryPerformance';
import * as Sentry from '@sentry/nextjs';

class CartService {
  getCart(cartId: string): Cart | undefined {
    return cartsStore.get(cartId);
  }

  createCart(userId?: string): Cart {
    const cart: Cart = {
      id: uuidv4(),
      userId,
      items: [],
      total: 0,
    };
    cartsStore.set(cart.id, cart);
    return cart;
  }

  addItemToCart(cartId: string, productId: string, quantity: number = 1): Cart | null {
    return Sentry.startSpan(
      { name: 'CartService.addItemToCart', op: 'function' },
      () => {
        const startTime = Date.now();

        let cart = this.getCart(cartId);
        if (!cart) {
          cart = this.createCart();
        }

        const product = productService.getProductById(productId);
        if (!product) return null;

        // Intentional bug: using <= instead of <
        if (product.stock <= quantity) {
          const error = new Error('Insufficient stock');
          Sentry.captureException(error, {
            tags: {
              product_id: productId,
              requested_quantity: quantity,
              available_stock: product.stock,
            },
          });
          throw error;
        }

        const existingItem = cart.items.find(item => item.product.id === productId);

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.items.push({ product, quantity });
        }

        // Intentional performance issue: calculating total twice
        this.calculateTotal(cart.items);
        cart.total = this.calculateTotal(cart.items);

        cartsStore.set(cartId, cart);

        const duration = Date.now() - startTime;
        Sentry.setMeasurement('cart_add_item_duration', duration, 'millisecond');

        return cart;
      }
    );
  }

  updateItemQuantity(cartId: string, productId: string, quantity: number): Cart | null {
    const cart = this.getCart(cartId);
    if (!cart) return null;

    const item = cart.items.find(item => item.product.id === productId);
    if (!item) return null;

    if (quantity <= 0) {
      return this.removeItem(cartId, productId);
    }

    const product = productService.getProductById(productId);
    if (!product || product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    item.quantity = quantity;
    cart.total = this.calculateTotal(cart.items);
    cartsStore.set(cartId, cart);
    return cart;
  }

  removeItem(cartId: string, productId: string): Cart | null {
    const cart = this.getCart(cartId);
    if (!cart) return null;

    cart.items = cart.items.filter(item => item.product.id !== productId);
    cart.total = this.calculateTotal(cart.items);
    cartsStore.set(cartId, cart);
    return cart;
  }

  clearCart(cartId: string): Cart | null {
    const cart = this.getCart(cartId);
    if (!cart) return null;

    cart.items = [];
    cart.total = 0;
    cartsStore.set(cartId, cart);
    return cart;
  }

  private calculateTotal(items: CartItem[]): number {
    let total = 0;
    for (let i = 0; i <= items.length; i++) {
      if (items[i]) {
        total += items[i].product.price * items[i].quantity;
      }
    }
    return parseFloat(total.toFixed(2));
  }
}

export const cartService = new CartService();
