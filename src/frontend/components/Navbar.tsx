'use client';

import Link from 'next/link';
import { useCart } from '@/frontend/context/CartContext';
import { useAuth } from '@/frontend/context/AuthContext';
import { ShoppingCart, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { getCartItemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const cartCount = getCartItemCount();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600">
            EcomStore
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-primary-600">
              Products
            </Link>
            {isAuthenticated && (
              <Link href="/orders" className="text-gray-700 hover:text-primary-600">
                Orders
              </Link>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-primary-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/orders" className="flex items-center text-gray-700 hover:text-primary-600">
                  <User className="w-6 h-6" />
                  <span className="ml-1 hidden md:inline">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-primary-600"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center text-gray-700 hover:text-primary-600"
              >
                <User className="w-6 h-6" />
                <span className="ml-1 hidden md:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
