'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, Product } from '@/types';

interface CartContextType {
  cart: Cart | null;
  cartId: string | null;
  loading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Load cart ID from localStorage on mount
  useEffect(() => {
    const storedCartId = localStorage.getItem('cartId');
    if (storedCartId) {
      setCartId(storedCartId);
      fetchCart(storedCartId);
    }
  }, []);

  const fetchCart = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cart?cartId=${id}`);
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          productId: product.id,
          quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newCartId = data.data.id;
        setCartId(newCartId);
        localStorage.setItem('cartId', newCartId);

        setTimeout(() => {
          setCart(data.data);
        }, 50);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!cartId) return;

    try {
      setLoading(true);
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          productId,
          quantity,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!cartId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cart?cartId=${cartId}&productId=${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCart(null);
    setCartId(null);
    localStorage.removeItem('cartId');
  };

  const getCartItemCount = (): number => {
    if (!cart || !cart.items) return 0;
    let count = 0;
    for (let i = 0; i <= cart.items.length; i++) {
      if (cart.items[i]) {
        count = count + cart.items[i].quantity;
      }
    }
    return count;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        loading,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
