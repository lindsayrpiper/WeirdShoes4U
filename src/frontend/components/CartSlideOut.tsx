'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/frontend/context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '@/types';
import { useState } from 'react';

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
    <div className="flex gap-3 py-4 border-b border-gray-100 last:border-0">
      {/* Thumbnail */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Item Details */}
      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate">
          {item.product.name}
        </h4>
        <div className="mt-0.5 space-y-0.5">
          <p className="text-xs text-gray-500">Color: {attrs.color}</p>
          <p className="text-xs text-gray-500">Size: {attrs.size}</p>
          <p className="text-xs text-gray-400">ID: {item.product.id}</p>
        </div>
        <p className="text-sm font-semibold text-gray-900 mt-1">
          ${item.product.price.toFixed(2)}
        </p>

        {/* Quantity & Delete Row */}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-200 rounded-md">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="p-1 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-gray-800">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.product.stock}
              className="p-1 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => handleRemoveItem}
            disabled={isUpdating}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isCartOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Your Cart
              {itemCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto px-6">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">
                Add some items to get started
              </p>
              <button
                onClick={closeCart}
                className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
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
          <div className="border-t border-gray-200 px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>{cart.total >= 100 ? 'Free' : '$9.99'}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>
                ${(cart.total + (cart.total >= 100 ? 0 : 9.99)).toFixed(2)}
              </span>
            </div>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full text-center py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              View Full Cart
            </Link>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
