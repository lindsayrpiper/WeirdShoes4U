'use client';

import Link from 'next/link';
import { useCart } from '@/frontend/context/CartContext';
import { useAuth } from '@/frontend/context/AuthContext';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { NavbarSearch } from './NavbarSearch';
import Logo from './Logo';

export default function Navbar() {
  const { getCartItemCount, openCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const cartCount = getCartItemCount();

  return (
    <nav className="bg-surface-200 border-b border-sentry-border">
      <div className="container mx-auto px-4">
        {/* Desktop Layout - Single Row */}
        <div className="hidden md:flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo className="h-8 w-auto" />
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <NavbarSearch />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8 flex-shrink-0">
            <Link href="/products" className="text-sentry-muted hover:text-sentry-text transition-colors">
              Products
            </Link>
            {isAuthenticated && (
              <Link href="/orders" className="text-sentry-muted hover:text-sentry-text transition-colors">
                Orders
              </Link>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Cart Icon */}
            <button onClick={openCart} className="relative">
              <ShoppingCart className="w-6 h-6 text-sentry-muted hover:text-sentry-text transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/orders" className="flex items-center text-sentry-muted hover:text-sentry-text transition-colors">
                  <User className="w-6 h-6" />
                  <span className="ml-1">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-sentry-muted hover:text-sentry-text transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center text-sentry-muted hover:text-sentry-text transition-colors"
              >
                <User className="w-6 h-6" />
                <span className="ml-1">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Layout - Two Rows */}
        <div className="md:hidden">
          {/* First Row: Logo and User Actions */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <Logo className="h-7 w-auto" />
            </Link>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <button onClick={openCart} className="relative">
                <ShoppingCart className="w-6 h-6 text-sentry-muted hover:text-sentry-text transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link href="/orders" className="text-sentry-muted hover:text-sentry-text transition-colors">
                    <User className="w-6 h-6" />
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sentry-muted hover:text-sentry-text transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-sentry-muted hover:text-sentry-text transition-colors"
                >
                  <User className="w-6 h-6" />
                </Link>
              )}
            </div>
          </div>

          {/* Second Row: Search Bar and Mobile Nav */}
          <div className="pb-3 space-y-2">
            <NavbarSearch />

            {/* Mobile Navigation Links */}
            <div className="flex items-center space-x-4 pt-2">
              <Link href="/products" className="text-sentry-muted hover:text-sentry-text text-sm transition-colors">
                Products
              </Link>
              {isAuthenticated && (
                <Link href="/orders" className="text-sentry-muted hover:text-sentry-text text-sm transition-colors">
                  Orders
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
