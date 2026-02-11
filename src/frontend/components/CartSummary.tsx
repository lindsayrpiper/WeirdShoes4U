'use client';

import Link from 'next/link';
import { useCart } from '@/frontend/context/CartContext';

export default function CartSummary() {
  const { cart } = useCart();

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const subtotal = cart.total;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (10%)</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">Total</span>
          <span className="text-2xl font-bold text-primary-600">${total.toFixed(2)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full bg-primary-600 text-white text-center py-3 rounded-md hover:bg-primary-700 transition-colors font-semibold"
      >
        Proceed to Checkout
      </Link>

      {subtotal < 100 && (
        <p className="text-sm text-gray-600 mt-4 text-center">
          Add ${(100 - subtotal).toFixed(2)} more for FREE shipping!
        </p>
      )}
    </div>
  );
}
