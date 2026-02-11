'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/frontend/context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '@/types';
import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

const MOCK_ATTRIBUTES: Record<string, { color: string; size: string }> = {
  '1': { color: 'Midnight Black', size: '10' },
  '2': { color: 'Silver', size: 'One Size' },
  '3': { color: 'Charcoal Gray', size: 'L' },
  '4': { color: 'White / RGB', size: 'Full' },
  '5': { color: 'Space Gray', size: 'One Size' },
  '6': { color: 'Matte Black', size: 'One Size' },
  '7': { color: 'Clear', size: 'Standard' },
  '8': { color: 'Navy Blue', size: 'M' },
};

function SlideOutCartItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const attrs = MOCK_ATTRIBUTES[item.product.id] || { color: 'Default', size: 'One Size' };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock) return;
    Sentry.logger.info('Cart slide-out: quantity change', {
      productId: item.product.id,
      productName: item.product.name,
      oldQuantity: item.quantity,
      newQuantity,
    });
    try {
      setIsUpdating(true);
      await updateQuantity(item.product.id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    Sentry.logger.info('Cart slide-out: remove item', {
      productId,
      productName: item.product.name,
    });
    try {
      setIsUpdating(true);
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-3 py-4 border-b border-sentry-border last:border-0">
      {/* Thumbnail */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-50">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Item Details */}
      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-semibold text-sentry-text truncate">
          {item.product.name}
        </h4>
        <div className="mt-0.5 space-y-0.5">
          <p className="text-xs text-sentry-muted">Color: {attrs.color}</p>
          <p className="text-xs text-sentry-muted">Size: {attrs.size}</p>
          <p className="text-xs text-surface-50">ID: {item.product.id}</p>
        </div>
        <p className="text-sm font-semibold text-sentry-text mt-1">
          ${item.product.price.toFixed(2)}
        </p>

        {/* Quantity & Delete Row */}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity Selector */}
          <div className="flex items-center border border-sentry-border rounded-md">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="p-1 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3.5 h-3.5 text-sentry-muted" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-sentry-text">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.product.stock}
              className="p-1 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-sentry-muted" />
            </button>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => handleRemoveItem}
            disabled={isUpdating}
            className="p-1.5 text-sentry-muted hover:text-accent-pink hover:bg-surface-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartSlideOut() {
  const { cart, isCartOpen, closeCart, getCartItemCount } = useCart();
  const itemCount = getCartItemCount();

  const handleClose = () => {
    Sentry.logger.info('Cart slide-out closed', { itemCount, cartTotal: cart?.total ?? 0 });
    closeCart();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isCartOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sentry-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-sentry-text">
              Your Cart
              {itemCount > 0 && (
                <span className="ml-2 text-sm font-normal text-sentry-muted">
                  ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-surface-50 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-sentry-muted" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto px-6">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="w-16 h-16 text-surface-50 mb-4" />
              <p className="text-sentry-muted font-medium">Your cart is empty</p>
              <p className="text-sm text-surface-50 mt-1">
                Add some items to get started
              </p>
              <button
                onClick={handleClose}
                className="mt-6 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-colors text-sm font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.items.map((item) => (
              <SlideOutCartItem key={item.product.id} item={item} />
            ))
          )}
        </div>

        {/* Footer with Totals */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-sentry-border px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm text-sentry-muted">
              <span>Subtotal</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-sentry-muted">
              <span>Shipping</span>
              <span>{cart.total >= 100 ? 'Free' : '$9.99'}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-sentry-text pt-2 border-t border-sentry-border">
              <span>Total</span>
              <span>
                ${(cart.total + (cart.total >= 100 ? 0 : 9.99)).toFixed(2)}
              </span>
            </div>
            <Link
              href="/cart"
              onClick={handleClose}
              className="block w-full text-center py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-colors font-semibold"
            >
              View Full Cart
            </Link>
            <Link
              href="/checkout"
              onClick={handleClose}
              className="block w-full text-center py-3 bg-accent-pink text-white rounded-lg hover:bg-accent-pink-dark transition-colors font-semibold"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
